import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { ApiResponse, ArtisanProfile } from '@craftsure/shared-types';

export const artisansRouter: Router = Router();

// In-memory artisan store
export const artisansMap = new Map<string, ArtisanProfile>();

// Seed master artisans for demonstration
artisansMap.set('artisan-lucknow-01', {
  id: 'artisan-lucknow-01',
  userId: 'user-artisan-lko',
  shopName: 'Awadh Heritage Crafts',
  bio: 'Generational master Chikankari artisans practicing traditional shadow work and jaali in Chowk, Lucknow.',
  districtId: 'dist-lucknow',
  clusterOrVillage: 'Old Chowk Artisan Cluster',
  location: { city: 'Lucknow', state: 'Uttar Pradesh' },
  craftSpecializations: ['lucknow-chikankari', 'zari-zardozi'],
  approvalStatus: 'approved',
  approvalNote: 'Verified traditional workshop during cluster census.',
  verificationTier: 'master_craftsperson',
  artisanPehchanCardNumber: 'UP/LKO/CHIKAN/0492',
  giAuthorizationStatus: 'gi_authorized_user',
  giAuthorizedUserNumber: 'GI/AU/7890/119',
  giCertificateDocumentUrl: '/certificates/gi/gi-au-7890-119.pdf',
  verifiedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

artisansMap.set('artisan-varanasi-01', {
  id: 'artisan-varanasi-01',
  userId: 'user-artisan-vns',
  shopName: 'Kashi Bunkar Sahkari Samiti',
  bio: 'Master weaver cooperative preserving traditional pure Katan silk Kadwa handloom techniques.',
  districtId: 'dist-varanasi',
  clusterOrVillage: 'Madanpura Weavers Colony',
  location: { city: 'Varanasi', state: 'Uttar Pradesh' },
  craftSpecializations: ['banarasi-silk'],
  approvalStatus: 'approved',
  approvalNote: 'Cooperative society registration verified.',
  verificationTier: 'master_craftsperson',
  artisanPehchanCardNumber: 'UP/VNS/WEAVE/1102',
  giAuthorizationStatus: 'gi_authorized_user',
  giAuthorizedUserNumber: 'GI/AU/3421/99',
  giCertificateDocumentUrl: '/certificates/gi/gi-au-3421-99.pdf',
  verifiedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const applySchema = z.object({
  shopName: z.string().min(2),
  bio: z.string().default(''),
  districtSlug: z.string().min(2),
  clusterOrVillage: z.string().optional(),
  craftSpecialization: z.string().min(2),
  artisanPehchanCardNumber: z.string().optional(),
  hasGiAuth: z.boolean().default(false),
  giAuthorizedUserNumber: z.string().optional(),
  giCertificateDocumentUrl: z.string().optional(),
});

/**
 * POST /api/artisans/apply
 * Registers new artisan application.
 * Non-Negotiable Rule 3: approvalStatus, verificationTier, and giAuthorizationStatus are decoupled.
 */
artisansRouter.post('/apply', (req: Request, res: Response) => {
  const parseResult = applySchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid artisan application data.',
        details: parseResult.error.flatten().fieldErrors,
      },
    };
    res.status(400).json(errorBody);
    return;
  }

  const data = parseResult.data;
  const id = `artisan-${Date.now()}`;

  // State machine decoupling:
  // - approvalStatus starts as 'pending'
  // - verificationTier: upgraded to 'identity_verified' if Pehchan ID provided, else 'unverified'
  // - giAuthorizationStatus: 'submitted_for_review' if GI number claimed, else 'none'
  const profile: ArtisanProfile = {
    id,
    userId: req.user?.id ?? `user-${id}`,
    shopName: data.shopName,
    bio: data.bio,
    districtId: `dist-${data.districtSlug}`,
    clusterOrVillage: data.clusterOrVillage,
    location: {
      city: data.districtSlug.charAt(0).toUpperCase() + data.districtSlug.slice(1),
      state: 'Uttar Pradesh',
    },
    craftSpecializations: [data.craftSpecialization],
    approvalStatus: 'pending',
    approvalNote: null,
    verificationTier: data.artisanPehchanCardNumber ? 'identity_verified' : 'unverified',
    artisanPehchanCardNumber: data.artisanPehchanCardNumber ?? null,
    giAuthorizationStatus:
      data.hasGiAuth && data.giAuthorizedUserNumber ? 'submitted_for_review' : 'none',
    giAuthorizedUserNumber: data.giAuthorizedUserNumber ?? null,
    giCertificateDocumentUrl: data.giCertificateDocumentUrl ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  artisansMap.set(id, profile);

  const responseBody: ApiResponse<ArtisanProfile> = {
    ok: true,
    data: profile,
  };

  res.status(201).json(responseBody);
});

/**
 * GET /api/artisans/:id
 */
artisansRouter.get('/:id', (req: Request, res: Response) => {
  const id = typeof req.params['id'] === 'string' ? req.params['id'] : '';
  const profile = artisansMap.get(id);

  if (!profile) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'ARTISAN_NOT_FOUND',
        message: `Artisan profile with ID "${id}" was not found.`,
      },
    };
    res.status(404).json(errorBody);
    return;
  }

  const responseBody: ApiResponse<ArtisanProfile> = {
    ok: true,
    data: profile,
  };

  res.json(responseBody);
});
