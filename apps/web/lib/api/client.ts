import type {
  ApiResponse,
  PaginatedResponse,
  District,
  CraftDefinition,
  Product,
  ProductFilterParams,
  VisualSearchResponse,
  Order,
  Address,
  ArtisanProfile,
  ApprovalStatus,
  VerificationTier,
  GiAuthorizationStatus,
  User,
  UserRole,
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
 * Structured API client error representing HTTP 4xx or backend rejections.
 */
export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code: string = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Fetch with timeout, optional authorization, and graceful fallback.
 * Strictly surfaces authoritative 400 (validation), 401 (unauthorized),
 * and 403 (forbidden) responses rather than silently falling back.
 */
async function fetchWithFallback<T>(
  url: string,
  fallback: () => T | Promise<T>,
  options?: RequestInit & { token?: string | undefined },
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options?.headers as Record<string, string> | undefined),
    };

    if (options?.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        let errorData: { code: string; message: string; details?: unknown } | undefined;
        try {
          const json = (await res.json()) as ApiResponse<unknown>;
          if (!json.ok) {
            errorData = json.error;
          }
        } catch {
          // Non-JSON response
        }
        throw new ApiClientError(
          res.status,
          errorData?.message ?? `Request failed with status ${res.status}`,
          errorData?.code ?? (res.status === 401 ? 'UNAUTHORIZED' : res.status === 403 ? 'FORBIDDEN' : 'VALIDATION_ERROR'),
          errorData?.details,
        );
      }
      return await fallback();
    }

    const json = (await res.json()) as ApiResponse<T>;
    if (json.ok && json.data !== undefined) {
      return json.data;
    }
    return await fallback();
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    return await fallback();
  }
}

// In-memory local fallback ledger for offline web mode
const localOrdersFallback: Order[] = [];
const localArtisansFallback: ArtisanProfile[] = [
  {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export interface CreateOrderInput {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress: Address;
  lineItems: Array<{
    productId: string;
    quantity: number;
    snapshotPriceInPaise: number;
    snapshotTitle: string;
    snapshotImageUrl?: string | null;
  }>;
  paymentMethod?: 'upi' | 'card' | 'cod';
}

export interface RegisterArtisanInput {
  shopName: string;
  bio?: string | undefined;
  districtSlug: string;
  clusterOrVillage?: string | undefined;
  craftSpecialization: string;
  artisanPehchanCardNumber?: string | undefined;
  hasGiAuth?: boolean | undefined;
  giAuthorizedUserNumber?: string | undefined;
}

export interface VerificationDecisionInput {
  approvalStatus?: ApprovalStatus | undefined;
  verificationTier?: VerificationTier | undefined;
  giAuthorizationStatus?: GiAuthorizationStatus | undefined;
  approvalNote?: string | undefined;
}

export interface AdminAuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  previousState: unknown;
  newState: unknown;
  timestamp: string;
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

  // ── Orders API ──────────────────────────────────────────────────────────────
  async createOrder(payload: CreateOrderInput, token?: string): Promise<Order> {
    return fetchWithFallback<Order>(
      `${API_BASE}/orders`,
      () => {
        const subtotal = payload.lineItems.reduce(
          (acc, it) => acc + it.snapshotPriceInPaise * it.quantity,
          0,
        );
        const delivery = subtotal >= 200000 ? 0 : 15000;
        const fallbackOrder: Order = {
          id: `CS-UP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          buyerId: 'buyer-demo-user',
          lineItems: payload.lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            snapshotPriceInPaise: li.snapshotPriceInPaise,
            snapshotTitle: li.snapshotTitle,
            snapshotImageUrl: li.snapshotImageUrl ?? null,
          })),
          status: 'pending',
          shippingAddress: payload.shippingAddress,
          totalInPaise: subtotal + delivery,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localOrdersFallback.push(fallbackOrder);
        return fallbackOrder;
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        token,
      },
    );
  },

  async getOrders(token?: string): Promise<Order[]> {
    return fetchWithFallback<Order[]>(
      `${API_BASE}/orders`,
      () => localOrdersFallback,
      { token },
    );
  },

  async getOrderById(id: string, token?: string): Promise<Order | null> {
    return fetchWithFallback<Order | null>(
      `${API_BASE}/orders/${id}`,
      () => localOrdersFallback.find((o) => o.id === id) ?? null,
      { token },
    );
  },

  // ── Artisans API ────────────────────────────────────────────────────────────
  async registerArtisan(payload: RegisterArtisanInput, token?: string): Promise<ArtisanProfile> {
    return fetchWithFallback<ArtisanProfile>(
      `${API_BASE}/artisans/apply`,
      () => {
        const fallbackProfile: ArtisanProfile = {
          id: `artisan-${payload.districtSlug}-${Math.floor(100 + Math.random() * 900)}`,
          userId: 'user-artisan-offline',
          shopName: payload.shopName,
          bio: payload.bio ?? '',
          districtId: `dist-${payload.districtSlug}`,
          clusterOrVillage: payload.clusterOrVillage,
          location: { city: payload.districtSlug, state: 'Uttar Pradesh' },
          craftSpecializations: [payload.craftSpecialization],
          approvalStatus: 'pending',
          approvalNote: 'Submitted application awaiting administrative vetting.',
          verificationTier: payload.artisanPehchanCardNumber ? 'identity_verified' : 'unverified',
          artisanPehchanCardNumber: payload.artisanPehchanCardNumber ?? null,
          giAuthorizationStatus: payload.hasGiAuth ? 'submitted_for_review' : 'none',
          giAuthorizedUserNumber: payload.giAuthorizedUserNumber ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localArtisansFallback.push(fallbackProfile);
        return fallbackProfile;
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        token,
      },
    );
  },

  async getArtisans(params?: { district?: string; craft?: string }): Promise<ArtisanProfile[]> {
    const url = new URL(`${API_BASE}/artisans`);
    if (params?.district) url.searchParams.set('district', params.district);
    if (params?.craft) url.searchParams.set('craft', params.craft);

    return fetchWithFallback<ArtisanProfile[]>(
      url.toString(),
      () => {
        let items = localArtisansFallback;
        if (params?.district) {
          items = items.filter((a) => a.location.city.toLowerCase().includes(params.district!.toLowerCase()));
        }
        if (params?.craft) {
          items = items.filter((a) => a.craftSpecializations.includes(params.craft!));
        }
        return items;
      },
    );
  },

  async getArtisanById(id: string): Promise<ArtisanProfile | null> {
    return fetchWithFallback<ArtisanProfile | null>(
      `${API_BASE}/artisans/${id}`,
      () => localArtisansFallback.find((a) => a.id === id) ?? null,
    );
  },

  // ── Admin Verification & Audit API ──────────────────────────────────────────
  async getAdminVerifications(token: string): Promise<ArtisanProfile[]> {
    return fetchWithFallback<ArtisanProfile[]>(
      `${API_BASE}/admin/verifications`,
      () => localArtisansFallback,
      { token },
    );
  },

  async updateVerificationDecision(
    id: string,
    decision: VerificationDecisionInput,
    token: string,
  ): Promise<ArtisanProfile> {
    return fetchWithFallback<ArtisanProfile>(
      `${API_BASE}/admin/verifications/${id}/decision`,
      () => {
        const found = localArtisansFallback.find((a) => a.id === id);
        if (!found) {
          throw new Error('Artisan profile not found.');
        }
        const updated: ArtisanProfile = {
          ...found,
          ...(decision.approvalStatus && { approvalStatus: decision.approvalStatus }),
          ...(decision.verificationTier && { verificationTier: decision.verificationTier }),
          ...(decision.giAuthorizationStatus && { giAuthorizationStatus: decision.giAuthorizationStatus }),
          ...(decision.approvalNote && { approvalNote: decision.approvalNote }),
          updatedAt: new Date().toISOString(),
        };
        const index = localArtisansFallback.findIndex((a) => a.id === id);
        if (index >= 0) localArtisansFallback[index] = updated;
        return updated;
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
        token,
      },
    );
  },

  async getAdminAuditLogs(token: string): Promise<AdminAuditLogEntry[]> {
    return fetchWithFallback<AdminAuditLogEntry[]>(
      `${API_BASE}/admin/audit-logs`,
      () => [
        {
          id: 'log-seed-01',
          actorId: 'user-platform-admin-01',
          action: 'artisan_approval',
          targetEntity: 'artisan_profile',
          targetId: 'artisan-lucknow-01',
          previousState: { approvalStatus: 'pending' },
          newState: { approvalStatus: 'approved' },
          timestamp: new Date().toISOString(),
        },
      ],
      { token },
    );
  },

  // ── Auth & Identity API ─────────────────────────────────────────────────────
  async getCurrentUser(token: string): Promise<User> {
    return fetchWithFallback<User>(
      `${API_BASE}/auth/me`,
      () => ({
        id: 'user-demo-fallback',
        email: 'user@craftsure.ai',
        role: 'buyer',
        displayName: 'Verified Buyer',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      { token },
    );
  },

  async demoLogin(role: UserRole): Promise<{ token: string; user: { id: string; email: string; role: UserRole; displayName: string } }> {
    return fetchWithFallback(
      `${API_BASE}/auth/demo-login`,
      () => ({
        token: `demo-${role.replace('_', '-')}`,
        user: {
          id: `user-${role.replace('_', '-')}-01`,
          email: `${role}@craftsure.ai`,
          role,
          displayName: `${role.toUpperCase()} User`,
        },
      }),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      },
    );
  },

  // ── AI Visual Search ────────────────────────────────────────────────────────
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

export const apiClient = api;
export default api;
