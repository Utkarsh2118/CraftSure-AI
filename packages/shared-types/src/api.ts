import type { CraftCategory, OfficialSourceStatus, Product } from './models';

// ─────────────────────────────────────────────────────────────────────────────
// API Envelope
// All API responses are wrapped in this discriminated union so callers
// always have a typed success/error path without relying on HTTP status codes
// alone.
// ─────────────────────────────────────────────────────────────────────────────

export type ApiResponse<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: ApiError };

export interface ApiError {
  readonly code: string;
  readonly message: string;
  // Optional machine-readable details (e.g., Zod validation errors)
  readonly details?: Record<string, unknown> | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNextPage: boolean;
}

export interface PaginationParams {
  readonly page?: number | undefined;
  readonly pageSize?: number | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Filter Parameters
// ─────────────────────────────────────────────────────────────────────────────

export type ProductSortOption = 'price_asc' | 'price_desc' | 'latest';

export interface ProductFilterParams extends PaginationParams {
  readonly district?: string | undefined;
  readonly category?: CraftCategory | undefined;
  readonly craft?: string | undefined;
  readonly technique?: string[] | string | undefined;
  readonly material?: string[] | string | undefined;
  readonly giCertifiedOnly?: boolean | undefined;
  readonly minPricePaise?: number | undefined;
  readonly maxPricePaise?: number | undefined;
  readonly sort?: ProductSortOption | undefined;
}

export interface DistrictFilterParams extends PaginationParams {
  readonly division?: string | undefined;
  readonly hasCrafts?: boolean | undefined;
}

export interface CraftFilterParams extends PaginationParams {
  readonly category?: CraftCategory | undefined;
  readonly district?: string | undefined;
  readonly giRegistered?: boolean | undefined;
  readonly officialStatus?: OfficialSourceStatus | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual Search (Phase 3 AI Discovery)
// ─────────────────────────────────────────────────────────────────────────────

export interface VisualSearchMatch {
  readonly craftDefinitionId: string;
  readonly craftName: string;
  readonly craftSlug: string;
  readonly primaryDistrictName: string;
  readonly detectedTechniques: string[];
  readonly visualSimilarityScore: number; // 0.0 - 1.0 (calibrated)
}

export interface VisualSearchResponse {
  readonly status: 'similarity_match' | 'unsupported_or_inconclusive';
  readonly calibratedConfidence: number; // 0.00 - 1.00
  readonly topMatches: VisualSearchMatch[];
  readonly matchedProducts: Product[];
  readonly disclaimer: string;
  readonly rejectionReason?:
    'low_confidence' | 'out_of_distribution' | 'ambiguous_visual_features' | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay Payments
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePaymentOrderRequest {
  readonly buyerName: string;
  readonly buyerEmail: string;
  readonly buyerPhone: string;
  readonly shippingAddress: {
    readonly line1: string;
    readonly line2?: string | undefined;
    readonly city: string;
    readonly state: string;
    readonly pincode: string;
    readonly country?: string | undefined;
  };
  readonly lineItems: Array<{
    readonly productId: string;
    readonly quantity: number;
  }>;
  readonly paymentMethod?: string | undefined;
}

export interface CreatePaymentOrderResponse {
  readonly orderId: string;
  readonly razorpayOrderId: string;
  readonly amountInPaise: number;
  readonly currency: string;
  readonly keyId: string;
  readonly buyerName: string;
  readonly buyerEmail: string;
  readonly buyerPhone: string;
}

export interface VerifyPaymentRequest {
  readonly orderId: string;
  readonly razorpayOrderId: string;
  readonly razorpayPaymentId: string;
  readonly razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  readonly success: boolean;
  readonly orderId: string;
  readonly status: string;
  readonly paymentStatus: string;
}
