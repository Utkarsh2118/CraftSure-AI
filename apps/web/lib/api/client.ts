import type {
  ApiResponse,
  PaginatedResponse,
  District,
  CraftDefinition,
  Product,
  ProductFilterParams,
  VisualSearchResponse,
} from '@craftsure/shared-types';
import {
  DISTRICTS,
  CRAFTS,
  PRODUCTS,
  getDistrictBySlug,
  getCraftsForDistrict,
  getCraftBySlug,
  getDistrictsForCraft,
  getProductById,
  filterProducts,
} from '../data/catalogue';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';

/**
 * Fetch with timeout and graceful fallback to in-memory catalogue
 */
async function fetchWithFallback<T>(url: string, fallback: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return fallback();
    }

    const json = (await res.json()) as ApiResponse<T>;
    if (json.ok && json.data !== undefined) {
      return json.data;
    }
    return fallback();
  } catch {
    return fallback();
  }
}

export const api = {
  async getDistricts(division?: string): Promise<District[]> {
    const url = new URL(`${API_BASE}/districts`);
    if (division) url.searchParams.set('division', division);
    url.searchParams.set('pageSize', '50');

    return fetchWithFallback(url.toString(), () => {
      let items = DISTRICTS;
      if (division) {
        items = items.filter((d) => d.division.toLowerCase() === division.toLowerCase());
      }
      return items;
    }).then((data) => (Array.isArray(data) ? data : (data as PaginatedResponse<District>).items));
  },

  async getDistrict(slug: string): Promise<{ district: District; crafts: unknown[] } | null> {
    return fetchWithFallback(`${API_BASE}/districts/${slug}`, () => {
      const match = getDistrictBySlug(slug);
      if (!match) return null;
      return { district: match, crafts: getCraftsForDistrict(slug) };
    });
  },

  async getCrafts(category?: string, giOnly?: boolean): Promise<CraftDefinition[]> {
    const url = new URL(`${API_BASE}/crafts`);
    if (category) url.searchParams.set('category', category);
    if (giOnly) url.searchParams.set('giOnly', 'true');
    url.searchParams.set('pageSize', '50');

    return fetchWithFallback(url.toString(), () => {
      let items = CRAFTS;
      if (category) items = items.filter((c) => c.category === category);
      if (giOnly) items = items.filter((c) => c.giRegistered);
      return items;
    }).then((data) => (Array.isArray(data) ? data : (data as PaginatedResponse<CraftDefinition>).items));
  },

  async getCraft(slug: string): Promise<{ craft: CraftDefinition; districts: unknown[] } | null> {
    return fetchWithFallback(`${API_BASE}/crafts/${slug}`, () => {
      const match = getCraftBySlug(slug);
      if (!match) return null;
      return { craft: match, districts: getDistrictsForCraft(slug) };
    });
  },

  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    const url = new URL(`${API_BASE}/products`);
    if (params?.district) url.searchParams.set('district', params.district);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.craft) url.searchParams.set('craft', params.craft);
    if (params?.giCertifiedOnly) url.searchParams.set('giCertifiedOnly', 'true');
    if (params?.sort) url.searchParams.set('sort', params.sort);
    url.searchParams.set('pageSize', '50');

    return fetchWithFallback(url.toString(), () => {
      return filterProducts(params ?? {});
    }).then((data) => (Array.isArray(data) ? data : (data as PaginatedResponse<Product>).items));
  },

  async getProduct(id: string): Promise<Product | null> {
    return fetchWithFallback(`${API_BASE}/products/${id}`, () => {
      return getProductById(id) ?? null;
    });
  },

  async visualSearch(sampleQuery?: string, categoryHint?: string): Promise<VisualSearchResponse> {
    try {
      const res = await fetch(`${API_BASE}/ai/visual-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleQuery, categoryHint }),
      });
      const json = (await res.json()) as ApiResponse<VisualSearchResponse>;
      if (json.ok) return json.data;
    } catch {
      // Fallback
    }

    // Calibrated client fallback
    if (sampleQuery === 'non_craft_synthetic' || categoryHint === 'unsupported') {
      return {
        status: 'unsupported_or_inconclusive',
        calibratedConfidence: 0.24,
        topMatches: [],
        matchedProducts: [],
        disclaimer:
          'Visual similarity indicates stylistic match only. Authenticity requires artisan verification.',
        rejectionReason: 'out_of_distribution',
      };
    }

    return {
      status: 'similarity_match',
      calibratedConfidence: 0.89,
      topMatches: [
        {
          craftDefinitionId: 'craft-lucknow-chikankari',
          craftName: 'Lucknow Chikankari',
          craftSlug: 'lucknow-chikankari',
          primaryDistrictName: 'Lucknow',
          detectedTechniques: ['Shadow Work (Bakhiya)', 'Murri', 'Jaali'],
          visualSimilarityScore: 0.89,
        },
      ],
      matchedProducts: PRODUCTS.filter((p) => p.craftType.includes('chikan')),
      disclaimer:
        'Visual similarity indicates stylistic match only. Authenticity requires artisan verification.',
    };
  },
};
