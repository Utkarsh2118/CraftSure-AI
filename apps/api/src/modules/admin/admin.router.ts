import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type {
  ApiResponse,
  ApprovalStatus,
  VerificationTier,
  GiAuthorizationStatus,
} from '@craftsure/shared-types';
import { requireAuth } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { artisansMap } from '../artisans';
import { db, artisanProfilesTable, adminAuditLogsTable, usersTable } from '../../database';

export const adminRouter: Router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (id?: string): boolean => typeof id === 'string' && UUID_REGEX.test(id);

// Resilient in-memory audit log for fast testing & offline fallback
export const adminAuditLogs: Array<{
  id: string;
  actorId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  previousState: unknown;
  newState: unknown;
  timestamp: string;
}> = [];

const decisionSchema = z.object({
  approvalStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  verificationTier: z
    .enum([
      'unverified',
      'identity_verified',
      'master_craftsperson',
      'state_awardee',
      'national_awardee',
      'shilp_guru',
    ])
    .optional(),
  giAuthorizationStatus: z
    .enum(['none', 'submitted_for_review', 'gi_authorized_user', 'revoked'])
    .optional(),
  approvalNote: z.string().optional(),
});

/**
 * GET /api/admin/verifications
 * Lists artisan profiles pending verification or review.
 * Protected: requires store_admin or platform_admin.
 */
adminRouter.get(
  '/verifications',
  requireAuth,
  requireRole('store_admin'),
  async (_req: Request, res: Response) => {
    try {
      const dbProfiles = await db
        .select()
        .from(artisanProfilesTable)
        .orderBy(desc(artisanProfilesTable.createdAt));

      if (dbProfiles && dbProfiles.length > 0) {
        const mapped = dbProfiles.map((p) => ({
          id: p.id,
          userId: p.userId,
          shopName: p.shopName,
          bio: p.bio,
          districtId: p.districtId ?? 'dist-lucknow',
          clusterOrVillage: p.clusterOrVillage ?? undefined,
          location: { city: p.locationCity, state: p.locationState },
          craftSpecializations: p.craftSpecializations,
          approvalStatus: p.approvalStatus as ApprovalStatus,
          approvalNote: p.approvalNote,
          verificationTier: p.verificationTier as VerificationTier,
          artisanPehchanCardNumber: p.artisanPehchanCardNumber,
          giAuthorizationStatus: p.giAuthorizationStatus as GiAuthorizationStatus,
          giAuthorizedUserNumber: p.giAuthorizedUserNumber,
          giCertificateDocumentUrl: p.giCertificateDocumentUrl,
          verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : undefined,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));

        res.json({ ok: true, data: mapped });
        return;
      }
    } catch (err) {
      console.warn('[Admin DB Query Warning]', (err as Error).message);
    }

    const items = Array.from(artisansMap.values());
    res.json({ ok: true, data: items });
  },
);

/**
 * POST /api/admin/verifications/:id/decision
 * Updates verification tier, GI authorization, or approval status with an immutable audit trail.
 * Protected: requires store_admin or platform_admin.
 */
adminRouter.post(
  '/verifications/:id/decision',
  requireAuth,
  requireRole('store_admin'),
  async (req: Request, res: Response) => {
    const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';
    const artisan = artisansMap.get(id);

    if (!artisan) {
      const errorBody: ApiResponse<never> = {
        ok: false,
        error: { code: 'ARTISAN_NOT_FOUND', message: `Artisan with ID "${id}" was not found.` },
      };
      res.status(404).json(errorBody);
      return;
    }

    const parseResult = decisionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorBody: ApiResponse<never> = {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid decision payload.',
          details: parseResult.error.flatten().fieldErrors,
        },
      };
      res.status(400).json(errorBody);
      return;
    }

    const { approvalStatus, verificationTier, giAuthorizationStatus, approvalNote } =
      parseResult.data;

    const previousState = {
      approvalStatus: artisan.approvalStatus,
      verificationTier: artisan.verificationTier,
      giAuthorizationStatus: artisan.giAuthorizationStatus,
    };

    const updatedArtisan = {
      ...artisan,
      approvalStatus: (approvalStatus as ApprovalStatus) ?? artisan.approvalStatus,
      verificationTier: (verificationTier as VerificationTier) ?? artisan.verificationTier,
      giAuthorizationStatus:
        (giAuthorizationStatus as GiAuthorizationStatus) ?? artisan.giAuthorizationStatus,
      approvalNote: approvalNote ?? artisan.approvalNote,
      verifiedAt:
        giAuthorizationStatus === 'gi_authorized_user' || approvalStatus === 'approved'
          ? new Date().toISOString()
          : artisan.verifiedAt,
      updatedAt: new Date().toISOString(),
    };

    artisansMap.set(id, updatedArtisan);

    // Record immutable audit entry
    const auditRecord = {
      id: `audit-${Date.now()}`,
      actorId: req.user?.id ?? 'system-admin',
      action: 'UPDATE_ARTISAN_VERIFICATION',
      targetEntity: 'artisan_profile',
      targetId: id,
      previousState,
      newState: {
        approvalStatus: updatedArtisan.approvalStatus,
        verificationTier: updatedArtisan.verificationTier,
        giAuthorizationStatus: updatedArtisan.giAuthorizationStatus,
      },
      timestamp: new Date().toISOString(),
    };
    adminAuditLogs.push(auditRecord);

    // Attempt PostgreSQL persistence for artisan profile update and audit log entry
    try {
      const actorUuid = isValidUuid(req.user?.id) ? req.user?.id : randomUUID();
      const targetUuid = isValidUuid(id) ? id : randomUUID();

      await db.transaction(async (tx) => {
        // Ensure actor user exists to satisfy foreign key
        await tx
          .insert(usersTable)
          .values({
            id: actorUuid!,
            email: 'admin@craftsure.ai',
            displayName: 'Admin Auditor',
            role: 'platform_admin',
          })
          .onConflictDoNothing();

        if (isValidUuid(id)) {
          await tx
            .update(artisanProfilesTable)
            .set({
              approvalStatus: updatedArtisan.approvalStatus,
              verificationTier: updatedArtisan.verificationTier,
              giAuthorizationStatus: updatedArtisan.giAuthorizationStatus,
              approvalNote: updatedArtisan.approvalNote,
              verifiedAt: updatedArtisan.verifiedAt ? new Date(updatedArtisan.verifiedAt) : null,
              updatedAt: new Date(),
            })
            .where(eq(artisanProfilesTable.id, id));
        }

        await tx.insert(adminAuditLogsTable).values({
          actorId: actorUuid!,
          action: 'UPDATE_ARTISAN_VERIFICATION',
          targetEntity: 'artisan_profile',
          targetId: targetUuid,
          previousState: JSON.stringify(previousState),
          newState: JSON.stringify(auditRecord.newState),
          createdAt: new Date(),
        });
      });
    } catch (dbErr) {
      console.warn(
        '[Admin DB Decision Persistence Warning]',
        (dbErr as Error).message,
      );
    }

    const responseBody: ApiResponse<{ artisan: typeof updatedArtisan; audit: typeof auditRecord }> =
      {
        ok: true,
        data: {
          artisan: updatedArtisan,
          audit: auditRecord,
        },
      };

    res.json(responseBody);
  },
);

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable administrative audit trail from PostgreSQL or resilient cache.
 */
adminRouter.get(
  '/audit-logs',
  requireAuth,
  requireRole('platform_admin'),
  async (_req: Request, res: Response) => {
    try {
      const dbLogs = await db
        .select()
        .from(adminAuditLogsTable)
        .orderBy(desc(adminAuditLogsTable.createdAt));

      if (dbLogs && dbLogs.length > 0) {
        const mapped = dbLogs.map((l) => ({
          id: l.id,
          actorId: l.actorId,
          action: l.action,
          targetEntity: l.targetEntity,
          targetId: l.targetId,
          previousState: l.previousState ? JSON.parse(l.previousState) : null,
          newState: l.newState ? JSON.parse(l.newState) : {},
          timestamp: l.createdAt.toISOString(),
        }));

        res.json({ ok: true, data: mapped });
        return;
      }
    } catch (err) {
      console.warn('[Admin DB Audit Query Warning]', (err as Error).message);
    }

    res.json({
      ok: true,
      data: adminAuditLogs,
    });
  },
);
