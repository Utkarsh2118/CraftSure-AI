import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type {
  ApiResponse,
  ApprovalStatus,
  VerificationTier,
  GiAuthorizationStatus,
} from '@craftsure/shared-types';
import { requireAuth } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { artisansMap } from './artisans';

export const adminRouter: Router = Router();

// In-memory administrative audit log
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
    .enum(['unverified', 'phone_verified', 'identity_verified', 'master_craftsperson'])
    .optional(),
  giAuthorizationStatus: z
    .enum(['none', 'applied', 'submitted_for_review', 'gi_authorized_user', 'rejected', 'revoked'])
    .optional(),
  approvalNote: z.string().optional(),
});

/**
 * GET /api/admin/verifications
 * Lists artisan profiles for administrative verification review.
 * Protected: requires store_admin or platform_admin.
 */
adminRouter.get(
  '/verifications',
  requireAuth,
  requireRole('store_admin'),
  (_req: Request, res: Response) => {
    const list = Array.from(artisansMap.values());
    const responseBody: ApiResponse<typeof list> = {
      ok: true,
      data: list,
    };
    res.json(responseBody);
  },
);

/**
 * POST /api/admin/verifications/:id/decision
 * Audits and updates one or more independent verification state machines.
 * Non-Negotiable Rule 3: Never infer approvalStatus, verificationTier, or giAuthorizationStatus from one another.
 */
adminRouter.post(
  '/verifications/:id/decision',
  requireAuth,
  requireRole('store_admin'),
  (req: Request, res: Response) => {
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
 * Retrieves immutable administrative audit trail.
 */
adminRouter.get(
  '/audit-logs',
  requireAuth,
  requireRole('platform_admin'),
  (_req: Request, res: Response) => {
    const responseBody: ApiResponse<typeof adminAuditLogs> = {
      ok: true,
      data: adminAuditLogs,
    };
    res.json(responseBody);
  },
);
