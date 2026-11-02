import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'buyer',
  'artisan',
  'store_admin',
  'platform_admin',
]);

export const craftCategoryEnum = pgEnum('craft_category', [
  'textiles_handloom',
  'metal_glass',
  'woodwork',
  'pottery_ceramics',
  'natural_fibre',
  'stone_inlay',
  'leather_craft',
  'other',
]);

export const approvalStatusEnum = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
  'suspended',
]);

export const verificationTierEnum = pgEnum('verification_tier', [
  'unverified',
  'phone_verified',
  'identity_verified',
  'master_craftsperson',
]);

export const giAuthorizationStatusEnum = pgEnum('gi_authorization_status', [
  'none',
  'applied',
  'submitted_for_review',
  'gi_authorized_user',
  'rejected',
  'revoked',
]);

export const associationTypeEnum = pgEnum('association_type', [
  'primary_traditional_hub',
  'secondary_cluster',
  'historical_spread',
]);

export const officialSourceStatusEnum = pgEnum('official_source_status', [
  'verified_official_source',
  'provisional_pending_verification',
]);

export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'out_of_stock',
  'archived',
]);

export const craftTypeEnum = pgEnum('craft_type', ['chikankari', 'zardozi', 'kashida', 'phulkari']);

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('buyer'),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Districts ─────────────────────────────────────────────────────────────────

export const districts = pgTable(
  'districts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(), // e.g. 'varanasi', 'moradabad'
    name: text('name').notNull(), // e.g. 'Varanasi'
    division: text('division').notNull(), // e.g. 'Varanasi Division'
    state: text('state').notNull().default('Uttar Pradesh'),
    heroImageUrl: text('hero_image_url'),
    overview: text('overview').notNull().default(''),
    odopPortalUrl: text('odop_portal_url').notNull(), // https://odopup.in/en/districts
    odopFocalCrafts: text('odop_focal_crafts').array().notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('districts_slug_idx').on(table.slug),
    divisionIdx: index('districts_division_idx').on(table.division),
    isActiveIdx: index('districts_is_active_idx').on(table.isActive),
  }),
);

// ── Craft Definitions ─────────────────────────────────────────────────────────

export const craftDefinitions = pgTable(
  'craft_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(), // e.g. 'gulabi-meenakari', 'tarkashi'
    name: text('name').notNull(), // e.g. 'Gulabi Meenakari'
    category: craftCategoryEnum('category').notNull(),
    giRegistered: boolean('gi_registered').notNull().default(false),
    giRegistrationNumber: text('gi_registration_number'), // e.g. '542'
    giRegistrationYear: integer('gi_registration_year'),
    description: text('description').notNull(),
    historicalContext: text('historical_context').notNull().default(''),
    standardTechniques: text('standard_techniques').array().notNull().default([]),
    typicalMaterials: text('typical_materials').array().notNull().default([]),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('craft_definitions_slug_idx').on(table.slug),
    categoryIdx: index('craft_definitions_category_idx').on(table.category),
    giRegisteredIdx: index('craft_definitions_gi_idx').on(table.giRegistered),
  }),
);

// ── Craft-Districts Many-to-Many ──────────────────────────────────────────────

export const craftDistricts = pgTable(
  'craft_districts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    craftDefinitionId: uuid('craft_definition_id')
      .notNull()
      .references(() => craftDefinitions.id, { onDelete: 'restrict' }),
    districtId: uuid('district_id')
      .notNull()
      .references(() => districts.id, { onDelete: 'restrict' }),
    associationType: associationTypeEnum('association_type')
      .notNull()
      .default('primary_traditional_hub'),
    officialSourceStatus: officialSourceStatusEnum('official_source_status')
      .notNull()
      .default('provisional_pending_verification'),

    // Data Provenance & Verification Tracking
    sourceTitle: text('source_title').notNull(),
    sourceUrl: text('source_url').notNull(),
    retrievalDate: timestamp('retrieval_date', { withTimezone: true }).notNull().defaultNow(),
    sourceCitation: text('source_citation').notNull(),
    sourceDocumentUrl: text('source_document_url'),
    isOdopRecognized: boolean('is_odop_recognized').notNull().default(false),

    // Dispute & Uncertainty Flagging
    flaggedForManualReview: boolean('flagged_for_manual_review').notNull().default(false),
    reviewNotes: text('review_notes'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    craftDistrictUnique: uniqueIndex('craft_districts_composite_idx').on(
      table.craftDefinitionId,
      table.districtId,
    ),
    districtIdx: index('craft_districts_district_idx').on(table.districtId),
    craftIdx: index('craft_districts_craft_idx').on(table.craftDefinitionId),
    officialStatusIdx: index('craft_districts_status_idx').on(table.officialSourceStatus),
    manualReviewIdx: index('craft_districts_review_idx').on(table.flaggedForManualReview),
  }),
);

// ── Artisan Profiles ──────────────────────────────────────────────────────────

export const artisanProfiles = pgTable(
  'artisan_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    shopName: text('shop_name').notNull(),
    bio: text('bio').notNull().default(''),
    districtId: uuid('district_id').references(() => districts.id, { onDelete: 'restrict' }),
    clusterOrVillage: text('cluster_or_village'),
    tehsil: text('tehsil'),
    locationCity: text('location_city').notNull(),
    locationState: text('location_state').notNull().default('Uttar Pradesh'),
    pincode: text('pincode'),

    // Specific craft specializations (references to craft_definitions slugs)
    craftSpecializations: text('craft_specializations').array().notNull().default([]),

    // Independent verification axes
    approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
    approvalNote: text('approval_note'),
    verificationTier: verificationTierEnum('verification_tier').notNull().default('unverified'),
    artisanPehchanCardNumber: text('artisan_pehchan_card_number'), // Ministry of Textiles ID

    // Explicit statutory GI status
    giAuthorizationStatus: giAuthorizationStatusEnum('gi_authorization_status')
      .notNull()
      .default('none'),
    giAuthorizedUserNumber: text('gi_authorized_user_number'), // e.g. 'GI/AU/7890/12'
    giCertificateDocumentUrl: text('gi_certificate_document_url'),
    giCertificateUrl: text('gi_certificate_url'), // Legacy backward-compatibility alias
    giRegistrationValidUntil: timestamp('gi_registration_valid_until', { withTimezone: true }),

    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    districtIdx: index('artisan_profiles_district_idx').on(table.districtId),
    approvalIdx: index('artisan_profiles_approval_idx').on(table.approvalStatus),
    giStatusIdx: index('artisan_profiles_gi_status_idx').on(table.giAuthorizationStatus),
  }),
);

// ── Products ──────────────────────────────────────────────────────────────────

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    artisanId: uuid('artisan_id')
      .notNull()
      .references(() => artisanProfiles.id, { onDelete: 'cascade' }),
    craftDefinitionId: uuid('craft_definition_id').references(() => craftDefinitions.id, {
      onDelete: 'restrict',
    }),
    districtId: uuid('district_id').references(() => districts.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),

    // Separated metadata fields
    category: craftCategoryEnum('category'),
    craftType: text('craft_type').notNull(), // e.g. 'chikankari', 'banarasi_silk', 'moradabad_metalware'
    techniques: text('techniques').array().notNull().default([]),
    materials: text('materials').array().notNull().default([]),
    fabric: text('fabric'), // Legacy backward-compatibility field

    // Structured origin cluster
    originCluster: text('origin_cluster'),
    originDistrict: text('origin_district'),

    // Authenticity & Certification
    isGiCraftItem: boolean('is_gi_craft_item').notNull().default(false),
    giBatchReference: text('gi_batch_reference'),

    // Media licensing & source transparency
    sourceOrganization: text('source_organization'),
    licenseType: text('license_type').notNull().default('artisan_commercial'),
    attributionText: text('attribution_text'),

    // Commercials (Integer paise)
    priceInPaise: integer('price_in_paise').notNull(),
    stockCount: integer('stock_count').notNull().default(0),
    status: productStatusEnum('status').notNull().default('draft'),
    tags: text('tags').array().notNull().default([]),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    artisanIdx: index('products_artisan_idx').on(table.artisanId),
    craftIdx: index('products_craft_idx').on(table.craftDefinitionId),
    districtIdx: index('products_district_idx').on(table.districtId),
    categoryStatusIdx: index('products_category_status_idx').on(table.category, table.status),
    priceIdx: index('products_price_idx').on(table.priceInPaise),
  }),
);

// ── Product Images ────────────────────────────────────────────────────────────

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    altText: text('alt_text').notNull().default(''),
    isPrimary: boolean('is_primary').notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),

    // Media provenance & licensing
    mediaRightsHolder: text('media_rights_holder'),
    licenseType: text('license_type').notNull().default('artisan_uploaded'),
    sha256Hash: text('sha256_hash'),
    fileSizeBytes: integer('file_size_bytes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productOrderIdx: index('product_images_order_idx').on(table.productId, table.displayOrder),
    sha256Idx: index('product_images_sha256_idx').on(table.sha256Hash),
  }),
);

// ── Administrative Audit Logs ─────────────────────────────────────────────────

export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    action: text('action').notNull(), // 'APPROVE_ARTISAN', 'VERIFY_GI_CERTIFICATE', 'REJECT_GI'
    targetEntity: text('target_entity').notNull(), // 'artisan_profile', 'product'
    targetId: uuid('target_id').notNull(),
    previousState: text('previous_state'),
    newState: text('new_state').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    targetIdx: index('admin_audit_target_idx').on(table.targetEntity, table.targetId),
    actorIdx: index('admin_audit_actor_idx').on(table.actorId),
  }),
);

// ── AI Inference Logs (Phase 3 Governance) ───────────────────────────────────

export const aiInferenceLogs = pgTable(
  'ai_inference_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requestImageHash: text('request_image_hash').notNull(),
    modelVersion: text('model_version').notNull(),
    weightsDigest: text('weights_digest').notNull(),
    predictedCraftDefinitionId: uuid('predicted_craft_definition_id').references(
      () => craftDefinitions.id,
    ),
    predictedDistrictId: uuid('predicted_district_id').references(() => districts.id),
    confidenceScore: integer('confidence_score_basis_points').notNull(), // 0–10000
    entropyScore: integer('entropy_basis_points').notNull(),
    isOodRejected: boolean('is_ood_rejected').notNull().default(false),
    latencyMs: integer('latency_ms').notNull(),
    userReportedIncorrect: boolean('user_reported_incorrect').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    modelIdx: index('ai_inference_model_idx').on(table.modelVersion),
    imageHashIdx: index('ai_inference_image_hash_idx').on(table.requestImageHash),
  }),
);
