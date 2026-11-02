import { Router } from 'express';
import type { Request, Response } from 'express';
import type {
  ApiResponse,
  PaginatedResponse,
  CraftDefinition,
  CraftCategory,
} from '@craftsure/shared-types';
import { SEED_CRAFTS, SEED_CRAFT_DISTRICTS, SEED_DISTRICTS } from '../db/data/upCatalogue';

export const craftsRouter = Router();

const craftsMap = new Map<string, CraftDefinition>();

for (const c of SEED_CRAFTS) {
  craftsMap.set(c.slug, {
    id: `craft-${c.slug}`,
    slug: c.slug,
    name: c.name,
    category: c.category,
    giRegistered: c.giRegistered,
    giRegistrationNumber: c.giRegistrationNumber,
    giRegistrationYear: c.giRegistrationYear,
    description: c.description,
    historicalContext: c.historicalContext,
    standardTechniques: c.standardTechniques,
    typicalMaterials: c.typicalMaterials,
    isActive: c.isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * GET /api/crafts
 * Lists craft definitions across Uttar Pradesh with category, district, and GI filters.
 */
craftsRouter.get('/', (req: Request, res: Response) => {
  const category = req.query['category'] as CraftCategory | undefined;
  const districtSlug =
    typeof req.query['district'] === 'string' ? req.query['district'] : undefined;
  const giOnly = req.query['giOnly'] === 'true';
  const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(String(req.query['pageSize'] ?? '20'), 10) || 20),
  );

  let items = Array.from(craftsMap.values()).filter((c) => c.isActive);

  if (category) {
    items = items.filter((c) => c.category === category);
  }

  if (giOnly) {
    items = items.filter((c) => c.giRegistered);
  }

  if (districtSlug) {
    const validCraftSlugs = new Set(
      SEED_CRAFT_DISTRICTS.filter((cd) => cd.districtSlug === districtSlug).map(
        (cd) => cd.craftSlug,
      ),
    );
    items = items.filter((c) => validCraftSlugs.has(c.slug));
  }

  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const responseBody: ApiResponse<PaginatedResponse<CraftDefinition>> = {
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
 * GET /api/crafts/:slug
 * Retrieves full craft definition, associated districts, techniques, and GI metadata.
 */
craftsRouter.get('/:slug', (req: Request, res: Response) => {
  const slug = typeof req.params['slug'] === 'string' ? req.params['slug'] : '';
  const craft = craftsMap.get(slug);

  if (!craft) {
    const errorBody: ApiResponse<never> = {
      ok: false,
      error: {
        code: 'CRAFT_NOT_FOUND',
        message: `Craft definition with slug "${slug}" not found in our catalogue.`,
      },
    };
    res.status(404).json(errorBody);
    return;
  }

  // Associated districts
  const associations = SEED_CRAFT_DISTRICTS.filter((cd) => cd.craftSlug === slug);
  const mappedDistricts = associations.map((assoc) => {
    const district = SEED_DISTRICTS.find((d) => d.slug === assoc.districtSlug);
    return {
      districtSlug: assoc.districtSlug,
      districtName: district?.name ?? assoc.districtSlug,
      division: district?.division ?? '',
      associationType: assoc.associationType,
      officialSourceStatus: assoc.officialSourceStatus,
      sourceTitle: assoc.sourceTitle,
      sourceUrl: assoc.sourceUrl,
      sourceCitation: assoc.sourceCitation,
      isOdopRecognized: assoc.isOdopRecognized,
    };
  });

  const responseBody: ApiResponse<{
    craft: CraftDefinition;
    districts: typeof mappedDistricts;
  }> = {
    ok: true,
    data: {
      craft,
      districts: mappedDistricts,
    },
  };

  res.json(responseBody);
});
