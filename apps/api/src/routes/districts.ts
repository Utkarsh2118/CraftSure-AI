import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, PaginatedResponse, District } from '@craftsure/shared-types';
import { SEED_DISTRICTS, SEED_CRAFT_DISTRICTS, SEED_CRAFTS } from '../db/data/upCatalogue';

export const districtsRouter = Router();

// In-memory catalog mapping for high-performance retrieval and offline dev
const districtsMap = new Map<string, District>();

// Initialise memory store from verified seed catalogue
for (const d of SEED_DISTRICTS) {
  districtsMap.set(d.slug, {
    id: `dist-${d.slug}`,
    slug: d.slug,
    name: d.name,
    division: d.division,
    state: d.state,
    heroImageUrl: null,
    overview: d.overview,
    odopPortalUrl: d.odopPortalUrl,
    odopFocalCrafts: d.odopFocalCrafts,
    isActive: d.isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * GET /api/districts
 * Lists active Uttar Pradesh districts with optional filtering and pagination.
 */
districtsRouter.get('/', (req: Request, res: Response) => {
  const division = typeof req.query['division'] === 'string' ? req.query['division'] : undefined;
  const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(String(req.query['pageSize'] ?? '20'), 10) || 20),
  );

  let items = Array.from(districtsMap.values()).filter((d) => d.isActive);

  if (division) {
    items = items.filter((d) => d.division.toLowerCase() === division.toLowerCase());
  }

  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const responseBody: ApiResponse<PaginatedResponse<District>> = {
    ok: true,
    data: {
      items: paginatedItems,
      total,
      page,
      pageSize,
      hasNextPage: startIndex + pageSize < total,
    },
  };

  res.json(responseBody);
});

/**
 * GET /api/districts/:slug
 * Retrieves full district profile including mapped craft associations and ODOP references.
 */
districtsRouter.get('/:slug', (req: Request, res: Response) => {
  const slug = typeof req.params['slug'] === 'string' ? req.params['slug'] : '';
  const district = districtsMap.get(slug);

  if (!district) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'DISTRICT_NOT_FOUND',
        message: `District with slug "${slug}" not found in our Uttar Pradesh catalogue.`,
      },
    };
    res.status(404).json(errorBody);
    return;
  }

  // Find associated crafts
  const associations = SEED_CRAFT_DISTRICTS.filter((cd) => cd.districtSlug === slug);
  const mappedCrafts = associations.map((assoc) => {
    const craft = SEED_CRAFTS.find((c) => c.slug === assoc.craftSlug);
    return {
      craftSlug: assoc.craftSlug,
      craftName: craft?.name ?? assoc.craftSlug,
      category: craft?.category ?? 'other',
      associationType: assoc.associationType,
      officialSourceStatus: assoc.officialSourceStatus,
      sourceTitle: assoc.sourceTitle,
      sourceUrl: assoc.sourceUrl,
      sourceCitation: assoc.sourceCitation,
      isOdopRecognized: assoc.isOdopRecognized,
      giRegistered: craft?.giRegistered ?? false,
      giRegistrationNumber: craft?.giRegistrationNumber ?? null,
    };
  });

  const responseBody: ApiResponse<{
    district: District;
    crafts: typeof mappedCrafts;
  }> = {
    ok: true,
    data: {
      district,
      crafts: mappedCrafts,
    },
  };

  res.json(responseBody);
});
