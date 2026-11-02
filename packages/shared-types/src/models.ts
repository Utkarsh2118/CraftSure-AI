// ─────────────────────────────────────────────────────────────────────────────
// Domain Models — Uttar Pradesh Regional Handicrafts & Artisanal Platform
// These are the canonical TypeScript representations of our database entities.
// They are read-only by design — mutations go through dedicated request types.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums & Value Types ──────────────────────────────────────────────────────

export type UserRole = 'buyer' | 'artisan' | 'store_admin' | 'platform_admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type VerificationTier =
  'unverified' | 'phone_verified' | 'identity_verified' | 'master_craftsperson';

export type GiAuthorizationStatus =
  'none' | 'applied' | 'submitted_for_review' | 'gi_authorized_user' | 'rejected' | 'revoked';

export type CraftCategory =
  | 'textiles_handloom'
  | 'metal_glass'
  | 'woodwork'
  | 'pottery_ceramics'
  | 'natural_fibre'
  | 'stone_inlay'
  | 'leather_craft'
  | 'other';

export type AssociationType = 'primary_traditional_hub' | 'secondary_cluster' | 'historical_spread';

export type OfficialSourceStatus = 'verified_official_source' | 'provisional_pending_verification';

export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived';

export type OrderStatus =
  'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type StarRating = 1 | 2 | 3 | 4 | 5;

/**
 * Backward-compatible legacy craft type union.
 * Recommended: use CraftDefinition.slug or string identifier.
 */
export type CraftType = 'chikankari' | 'zardozi' | 'kashida' | 'phulkari' | string;

// ── Shared Value Types ───────────────────────────────────────────────────────

export interface Address {
  readonly line1: string;
  readonly line2?: string | undefined;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly country: string;
}

export interface Location {
  readonly city: string;
  readonly state: string;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string;
}

// ── District ─────────────────────────────────────────────────────────────────

export interface District {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly division: string;
  readonly state: string;
  readonly heroImageUrl: string | null;
  readonly overview: string;
  readonly odopPortalUrl: string;
  readonly odopFocalCrafts: string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Craft Definition ─────────────────────────────────────────────────────────

export interface CraftDefinition {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: CraftCategory;
  readonly giRegistered: boolean;
  readonly giRegistrationNumber: string | null;
  readonly giRegistrationYear: number | null;
  readonly description: string;
  readonly historicalContext: string;
  readonly standardTechniques: string[];
  readonly typicalMaterials: string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Craft-District Association ───────────────────────────────────────────────

export interface CraftDistrict {
  readonly id: string;
  readonly craftDefinitionId: string;
  readonly districtId: string;
  readonly associationType: AssociationType;
  readonly officialSourceStatus: OfficialSourceStatus;
  readonly sourceTitle: string;
  readonly sourceUrl: string;
  readonly retrievalDate: string;
  readonly sourceCitation: string;
  readonly sourceDocumentUrl: string | null;
  readonly isOdopRecognized: boolean;
  readonly flaggedForManualReview: boolean;
  readonly reviewNotes: string | null;
  readonly createdAt: string;
}

// ── Artisan Profile ───────────────────────────────────────────────────────────

export interface ArtisanProfile {
  readonly id: string;
  readonly userId: string;
  readonly shopName: string;
  readonly bio: string;
  readonly districtId?: string | undefined;
  readonly clusterOrVillage?: string | undefined;
  readonly tehsil?: string | null | undefined;
  readonly location: Location;
  readonly craftSpecializations: string[];

  // Decoupled verification axes
  readonly approvalStatus: ApprovalStatus;
  readonly approvalNote: string | null;
  readonly verificationTier: VerificationTier;
  readonly artisanPehchanCardNumber?: string | null | undefined;
  readonly giAuthorizationStatus: GiAuthorizationStatus;
  readonly giAuthorizedUserNumber?: string | null | undefined;
  readonly giCertificateDocumentUrl?: string | null | undefined;
  /** Legacy alias for giCertificateDocumentUrl */
  readonly giCertificateUrl?: string | null | undefined;
  readonly giRegistrationValidUntil?: string | null | undefined;
  readonly verifiedAt?: string | null | undefined;

  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface ProductImage {
  readonly id: string;
  readonly productId: string;
  readonly url: string;
  readonly thumbnailUrl?: string | null | undefined;
  readonly altText: string;
  readonly isPrimary: boolean;
  readonly displayOrder: number;
  readonly mediaRightsHolder?: string | undefined;
  readonly licenseType?: string | undefined;
  readonly sha256Hash?: string | undefined;
}

export interface Product {
  readonly id: string;
  readonly artisanId: string;
  /** Denormalised for display; fetch full artisan profile separately. */
  readonly artisanShopName: string;
  readonly craftDefinitionId?: string | undefined;
  readonly districtId?: string | undefined;
  readonly title: string;
  readonly description: string;
  readonly category?: CraftCategory | undefined;
  readonly craftType: CraftType;
  readonly techniques: string[];
  readonly materials?: string[] | undefined;
  /** Legacy field for textiles — prefer materials */
  readonly fabric?: string | undefined;
  readonly originCluster?: string | undefined;
  readonly originDistrict?: string | undefined;
  readonly isGiCraftItem?: boolean | undefined;
  readonly sourceOrganization?: string | null | undefined;
  readonly licenseType?: string | undefined;
  readonly attributionText?: string | null | undefined;
  /**
   * Price stored in paise (integer) to avoid floating-point errors.
   * Always format for display using the currency utility.
   */
  readonly priceInPaise: number;
  readonly stockCount: number;
  readonly images: ProductImage[];
  readonly status: ProductStatus;
  readonly tags: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Order ─────────────────────────────────────────────────────────────────────

export interface OrderLineItem {
  readonly productId: string;
  readonly quantity: number;
  /** Price captured at order time — never updated after creation. */
  readonly snapshotPriceInPaise: number;
  readonly snapshotTitle: string;
  readonly snapshotImageUrl: string | null;
}

export interface Order {
  readonly id: string;
  readonly buyerId: string;
  readonly lineItems: OrderLineItem[];
  readonly status: OrderStatus;
  readonly shippingAddress: Address;
  readonly totalInPaise: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Review (Phase 2) ──────────────────────────────────────────────────────────

export interface Review {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly buyerId: string;
  readonly buyerDisplayName: string;
  readonly rating: StarRating;
  readonly body: string | null;
  /** Buyer-uploaded images, moderated before display. */
  readonly images: string[];
  readonly createdAt: string;
}

// ── Saved Collection ──────────────────────────────────────────────────────────

export interface SavedCollection {
  readonly id: string;
  readonly buyerId: string;
  readonly name: string;
  readonly productIds: string[];
  /** The "Saved" collection is the default and cannot be deleted. */
  readonly isDefault: boolean;
}
