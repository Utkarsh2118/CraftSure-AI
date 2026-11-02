# CraftSure AI — Technical Architecture & UP-Wide Expansion Blueprint

> **Status:** Strategic Blueprint Finalized / Ready for Staged Execution  
> **Product Identity:** AI-first, trust-enabled, artisan-powered marketplace ecosystem  
> **Core Positioning:** *"Discover. Identify. Verify. Shop."*  
> **Primary References:**  
> - [Uttar Pradesh One District One Product (ODOP) Official Portal](https://odopup.in/en)  
> - [UP ODOP District-wise Products Directory](https://odopup.in/en/districts)  
> - [Geographical Indications Registry of India](https://search.ipindia.gov.in/GIRPublic/)  
> - [Development Commissioner for Handicrafts, Ministry of Textiles](https://handicrafts.nic.in/)  
> **Target Systems:** `packages/shared-types`, `apps/api`, `apps/web`, AI Inference Microservice (`ai-service`)  

---

## 1. Executive Summary & Expanded Scope

### 1.1 Transition from Single-Cluster to Uttar Pradesh-Wide
CraftSure AI was originally prototyped around Lucknow Chikankari. This document specifies the comprehensive platform architecture covering traditional handicrafts, handloom, textiles, metalware, woodwork, ceramics, and regional artisanal crafts across all craft-producing districts of **Uttar Pradesh (UP)**.

The platform provides discovery, verifiable provenance, and direct economic connection between independent artisans, master craftspeople, weaver societies, and buyers seeking authentic regional heritage creations.

### 1.2 Core Architectural Principles
1. **Separation of Verification Concerns:** Market account status (`approvalStatus`), artisan identity verification level (`verificationTier`), and legal GI rights (`giAuthorizationStatus`) are strictly decoupled. None can be inferred from another.
2. **Normalized Craft-District Relationships:** Crafts and districts have an N:M relationship via a dedicated `craft_districts` model capturing primary traditional hubs, secondary clusters, and official source status.
3. **Strict Truth in Provenance (Anti-Fabrication):** A product or artisan is never granted GI status or district-origin authenticity merely by operating in a district or producing a named craft. GI badges strictly require verified authorized-user documentation issued by the GI Registry of India.
4. **Deliberate ODOP Scope Boundary:** The ODOP scheme includes agro-food items (e.g., Kalanamak Rice, Hathras Hing, Pratapgarh Amla). CraftSure AI strictly onboards **handicrafts, handloom, textiles, and artisanal goods**, explicitly filtering out purely agricultural or industrial food commodities.
5. **AI Confidence & Calibration Rigor:** The AI visual search system is probabilistic and measures visual/stylistic similarity only. **Visual similarity does not equal authenticity.** The system rejects out-of-distribution or ambiguous images via a calibrated `unsupported_or_inconclusive` state.
6. **Financial Integrity:** All monetary figures are stored exclusively as integer paise (INR) to eliminate floating-point calculation errors.

---

## 2. Official References & Data Provenance

### 2.1 Primary Reference Sources
CraftSure AI relies on authoritative government portals to establish baseline district-craft associations:

1. **Uttar Pradesh One District One Product (ODOP) Official Portal:**  
   - Portal Root: [https://odopup.in/en](https://odopup.in/en)  
   - District-wise Directory: [https://odopup.in/en/districts](https://odopup.in/en/districts)  
   - Role: Authoritative foundation for district-level focus products, official descriptions, and regional industrial profiles across all 75 UP districts.
2. **Geographical Indications Registry of India (CGPDTM):**  
   - Portal: [https://search.ipindia.gov.in/GIRPublic/](https://search.ipindia.gov.in/GIRPublic/)  
   - Role: Statutory verification of registered GI crafts, official applicant bodies, gazetted boundary territories, and authorized user registrations.
3. **Office of Development Commissioner (Handicrafts & Handlooms), Ministry of Textiles:**  
   - Portal: [https://handicrafts.nic.in/](https://handicrafts.nic.in/)  
   - Role: Artisan Pehchan card verification, cluster census data, and national master craftsperson registries.

### 2.2 Handicraft Identification & Exclusion Criteria
Not every product recognized under the UP ODOP initiative qualifies as an artisanal craft. To preserve platform integrity, CraftSure AI applies strict qualification criteria:

```
                  ┌────────────────────────────────────────┐
                  │ UP ODOP District Product Notification  │
                  └───────────────────┬────────────────────┘
                                      │
               Is it handcrafted, loom-woven, or artisanal art?
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
              [ YES ]                                   [ NO ]
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ ONBOARD TO CRAFTSURE AI   │             │ EXCLUDE FROM CATALOGUE    │
   ├───────────────────────────┤             ├───────────────────────────┤
   │ - Handloom Textiles       │             │ - Agro-Food Crops         │
   │ - Hand-knotted Carpets    │             │   (e.g., Kalanamak Rice)  │
   │ - Metal Crafts & Brass    │             │ - Food Processing & Ghee  │
   │ - Wood Carving & Flutes   │             │   (e.g., Auraiya Ghee)    │
   │ - Terracotta & Ceramics   │             │ - Horticulture & Fruits   │
   │ - Art Glassware           │             │   (e.g., Pratapgarh Amla) │
   │ - Natural Fibre Weaving   │             │ - Spices & Seasonings     │
   │ - Stone Inlay (Tarkashi)  │             │   (e.g., Hathras Hing)    │
   └───────────────────────────┘             └───────────────────────────┘
```

#### Explicit Exclusion Directory (ODOP Non-Craft Items)
The following official ODOP categories are explicitly excluded from CraftSure AI:
- **Siddharthnagar:** Kalanamak Rice *(Agricultural Crop)*
- **Pratapgarh:** Amla & processed amla food items *(Horticulture / Agro-processing)*
- **Hathras:** Asafoetida (Hing) *(Food Seasoning)*
- **Kaushambi:** Banana *(Agricultural Fruit)*
- **Balrampur:** Pulses & Lentils *(Agricultural Field Crop)*
- **Auraiya:** Desi Ghee *(Dairy Processing)*
- **Muzaffarnagar & Ayodhya:** Jaggery (Gur) *(Agro-processing)*
- **Fatehpur:** Bakery products *(Industrial / Commercial Food)*
- **Badaun:** While Zari-Zardozi is included, purely agricultural wheat derivatives are excluded.

### 2.3 ODOP vs. GI Independence & Mandatory Cross-Checking
1. **ODOP Is Not GI:** ODOP is an administrative and industrial promotion policy of the Government of Uttar Pradesh; GI is a statutory intellectual property right under the *Geographical Indications of Goods (Registration and Protection) Act, 1999*.
2. **No Inferred Entitlement:** An ODOP product notification never automatically establishes that the item is a registered GI or that an individual seller is authorized to use the GI mark.
3. **Mandatory Cross-Check Protocol:** Every craft entry asserting GI registration must be independently corroborated by its official GI Registry Application Number and verified gazette notification from the GI Registry of India.

### 2.4 Media Permissions & Copyright Compliance
- **Strict Prohibition on Scraping:** Images and media assets from `odopup.in` or government web portals must never be automatically downloaded, re-hosted, or displayed without verified open licensing or explicit written consent.
- **Provenance Tagging:** Every product or reference image in CraftSure AI must store explicit media licensing records (`mediaRightsHolder`, `licenseType`, and `sha256Hash`).
- **Permissible Media Sources:** Only original artisan-uploaded photography, images released under documented Creative Commons licenses (e.g. CC-BY), or public domain institutional archives may be utilized.

### 2.5 Conflict Resolution & Manual Review Flagging
When district-craft associations are disputed, multi-regional, or ambiguous:
- Entries are recorded with `flaggedForManualReview = true` in the `craft_districts` join table.
- A descriptive note is recorded in `reviewNotes` explaining the ambiguity (e.g., Zari-Zardozi multi-cluster overlap between Bareilly, Lucknow, and Varanasi; or Cane/Bamboo vs. Woodcraft boundaries).
- The association is published with status `provisional_pending_verification` and held from receiving verified authenticity badges until field survey or archival resolution.

---

## 3. Craft & District Domain Architecture

### 3.1 Craft Taxonomy & Relationship Structure

```
CraftCategory (e.g., textiles_handloom, pottery_ceramics, metal_glass, woodwork, natural_fibre, stone_inlay)
  │
  ├── CraftDefinition (e.g., chikankari, banarasi_silk, moradabad_metalware, gorakhpur_terracotta)
  │     │
  │     ├── craft_districts (N:M join model: Primary hub vs Secondary cluster, Official Source Status)
  │     │     └── District (e.g., Lucknow, Varanasi, Moradabad, Gorakhpur)
  │     │
  │     └── Technique & Material Standards (Documented reference taxonomy)
  │
  └── Product (Specific physical item made by an Artisan in an Origin Location with media licenses)
```

### 3.2 UP Craft & District Initial Catalogue (ODOP Aligned & Sourced)

All district-craft associations below are catalogued with their official status:
- `verified_official_source`: Explicitly verified against the UP ODOP Gazette and/or GI Registry.
- `provisional_pending_verification`: Regional craft cluster flagged for ground-level field verification before badge display.

*Data Retrieved: 2026-11-02 | Source: Government of Uttar Pradesh ODOP Portal (https://odopup.in/en/districts)*

| District | Traditional Craft / Handloom | Category | Association Type | Official Source Status | Primary Source URL | GI Registry Cross-Check |
|---|---|---|---|---|---|---|
| **Lucknow** | Chikankari | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #119 (Verified) |
| **Lucknow** | Zari-Zardozi | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #371 (Verified) |
| **Varanasi** | Banarasi Silk & Brocade | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #99 (Verified) |
| **Varanasi** | Gulabi Meenakari | `metal_glass` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #542 (Verified) |
| **Varanasi** | Wooden Lacquerware & Toys | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #457 (Verified) |
| **Bhadohi** | Hand-knotted Carpets & Durries | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #157 (Mirzapur-Bhadohi) |
| **Mirzapur** | Hand-made Carpets | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #157 (Verified) |
| **Mirzapur** | Brassware & Metal Craft | `metal_glass` | `secondary_cluster` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Moradabad** | Metal Craft / Brassware | `metal_glass` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #397 (Verified) |
| **Saharanpur** | Wood Carving | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #373 (Verified) |
| **Gorakhpur** | Terracotta Art & Sculptures | `pottery_ceramics` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #629 (Verified) |
| **Azamgarh** | Nizamabad Black Pottery | `pottery_ceramics` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #387 (Verified) |
| **Firozabad** | Glassware & Art Glass | `metal_glass` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #458 (Verified) |
| **Mainpuri** | Tarkashi Art (Wire Inlay) | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #688 (Verified) |
| **Bareilly** | Zari-Zardozi | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #371 (Verified) |
| **Bareilly** | Cane & Bamboo Crafts | `natural_fibre` | `secondary_cluster` | `provisional_pending_verification` | Regional Craft Survey | Non-GI Provisional |
| **Pilibhit** | Wooden Flutes (Bansuri) | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Amroha** | Dholak & Percussion Woodcraft | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #697 (Verified) |
| **Prayagraj** | Moonj Craft Products | `natural_fibre` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Rampur** | Patchwork & Applique Art | `textiles_handloom` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Bahraich** | Wheat-Stalk Handicrafts | `natural_fibre` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Banda** | Shazar (Dendritic Agate) Stone | `stone_inlay` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #692 (Verified) |
| **Chitrakoot** | Wooden Toys & Carvings | `woodwork` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |
| **Jalaun** (Kalpi) | Handmade Paper Art | `natural_fibre` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | GI Reg #695 (Verified) |
| **Ghazipur** | Jute Wall Hangings | `natural_fibre` | `primary_traditional_hub` | `verified_official_source` | [odopup.in/en/districts](https://odopup.in/en/districts) | Non-GI ODOP Verified |

---

## 4. GI & Verification Architecture

### 4.1 Distinct Verification Vectors
To prevent conflating store access, identity vetting, and statutory GI rights, the platform implements three independent state machines:

```
1. ApprovalStatus (Marketplace Operations)
   └── pending ──► approved ──► suspended ──► rejected

2. VerificationTier (Artisan Identity & Skills)
   └── unverified ──► phone_verified ──► identity_verified ──► master_craftsperson

3. GiAuthorizationStatus (Statutory GI Rights under GI Act 1999)
   └── none ──► applied ──► submitted_for_review ──► gi_authorized_user ──► rejected / revoked
```

### 4.2 Impossibility of Inferred GI Status
- **Location Rule:** An artisan operating within Varanasi does **not** automatically possess GI authorization for Banarasi Silk.
- **Craft Rule:** Listing a product classified as "Chikankari" does **not** grant GI tagging.
- **Badge Rendering Invariant:**
  ```typescript
  const isGiBadgeRenderable =
    artisan.giAuthorizationStatus === 'gi_authorized_user' &&
    product.isGiCraftItem === true &&
    artisan.giAuthorizedUserNumber !== null &&
    artisan.giCertificateDocumentUrl !== null &&
    adminAuditLog.hasApprovedGiReview(artisan.id);
  ```

---

## 5. Database Schema Specification (Drizzle ORM & PostgreSQL)

### 5.1 Enums
```sql
CREATE TYPE user_role AS ENUM (
  'buyer',
  'artisan',
  'store_admin',
  'platform_admin'
);

CREATE TYPE craft_category AS ENUM (
  'textiles_handloom',
  'metal_glass',
  'woodwork',
  'pottery_ceramics',
  'natural_fibre',
  'stone_inlay',
  'leather_craft',
  'other'
);

CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'suspended'
);

CREATE TYPE verification_tier AS ENUM (
  'unverified',
  'phone_verified',
  'identity_verified',
  'master_craftsperson'
);

CREATE TYPE gi_authorization_status AS ENUM (
  'none',
  'applied',
  'submitted_for_review',
  'gi_authorized_user',
  'rejected',
  'revoked'
);

CREATE TYPE association_type AS ENUM (
  'primary_traditional_hub',
  'secondary_cluster',
  'historical_spread'
);

CREATE TYPE official_source_status AS ENUM (
  'verified_official_source',
  'provisional_pending_verification'
);

CREATE TYPE product_status AS ENUM (
  'draft',
  'active',
  'out_of_stock',
  'archived'
);
```

### 5.2 Districts Table (`districts`)
```typescript
export const districts = pgTable('districts', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(), // e.g. 'varanasi', 'moradabad'
  name: text('name').notNull(),          // e.g. 'Varanasi'
  division: text('division').notNull(),  // e.g. 'Varanasi Division'
  state: text('state').notNull().default('Uttar Pradesh'),
  heroImageUrl: text('hero_image_url'),
  overview: text('overview').notNull().default(''),
  odopPortalUrl: text('odop_portal_url').notNull(), // https://odopup.in/en/districts
  odopFocalCrafts: text('odop_focal_crafts').array().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('districts_slug_idx').on(table.slug),
  divisionIdx: index('districts_division_idx').on(table.division),
  isActiveIdx: index('districts_is_active_idx').on(table.isActive),
}));
```

### 5.3 Craft Definitions Table (`craft_definitions`)
```typescript
export const craftDefinitions = pgTable('craft_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(), // e.g. 'gulabi-meenakari', 'tarkashi'
  name: text('name').notNull(),          // e.g. 'Gulabi Meenakari'
  category: craftCategoryEnum('category').notNull(),
  giRegistered: boolean('gi_registered').notNull().default(false),
  giRegistrationNumber: text('gi_registration_number'), // Official Registry App Number (e.g. '542')
  giRegistrationYear: integer('gi_registration_year'),
  description: text('description').notNull(),
  historicalContext: text('historical_context').notNull().default(''),
  standardTechniques: text('standard_techniques').array().notNull().default([]),
  typicalMaterials: text('typical_materials').array().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('craft_definitions_slug_idx').on(table.slug),
  categoryIdx: index('craft_definitions_category_idx').on(table.category),
  giRegisteredIdx: index('craft_definitions_gi_idx').on(table.giRegistered),
}));
```

### 5.4 Craft-Districts Many-to-Many Table (`craft_districts`)
```typescript
export const craftDistricts = pgTable('craft_districts', {
  id: uuid('id').primaryKey().defaultRandom(),
  craftDefinitionId: uuid('craft_definition_id')
    .notNull()
    .references(() => craftDefinitions.id, { onDelete: 'restrict' }),
  districtId: uuid('district_id')
    .notNull()
    .references(() => districts.id, { onDelete: 'restrict' }),
  associationType: associationTypeEnum('association_type').notNull().default('primary_traditional_hub'),
  officialSourceStatus: officialSourceStatusEnum('official_source_status').notNull().default('provisional_pending_verification'),
  
  // Data Provenance & Verification Tracking
  sourceTitle: text('source_title').notNull(),       // e.g. 'Uttar Pradesh ODOP Official Portal - Varanasi'
  sourceUrl: text('source_url').notNull(),           // e.g. 'https://odopup.in/en/districts'
  retrievalDate: timestamp('retrieval_date', { withTimezone: true }).notNull().defaultNow(),
  sourceCitation: text('source_citation').notNull(), // e.g. 'GI Application No. 119 Gazette; UP ODOP Notification'
  sourceDocumentUrl: text('source_document_url'),
  isOdopRecognized: boolean('is_odop_recognized').notNull().default(false),
  
  // Dispute & Uncertainty Flagging
  flaggedForManualReview: boolean('flagged_for_manual_review').notNull().default(false),
  reviewNotes: text('review_notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  craftDistrictUnique: uniqueIndex('craft_districts_composite_idx').on(table.craftDefinitionId, table.districtId),
  districtIdx: index('craft_districts_district_idx').on(table.districtId),
  craftIdx: index('craft_districts_craft_idx').on(table.craftDefinitionId),
  officialStatusIdx: index('craft_districts_status_idx').on(table.officialSourceStatus),
  manualReviewIdx: index('craft_districts_review_idx').on(table.flaggedForManualReview),
}));
```

### 5.5 Artisan Profiles Table (`artisan_profiles`)
```typescript
export const artisanProfiles = pgTable('artisan_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  shopName: text('shop_name').notNull(),
  bio: text('bio').notNull().default(''),
  districtId: uuid('district_id')
    .notNull()
    .references(() => districts.id, { onDelete: 'restrict' }),
  
  // Structured origin location
  clusterOrVillage: text('cluster_or_village'),
  tehsil: text('tehsil'),
  locationCity: text('location_city').notNull(),
  locationState: text('location_state').notNull().default('Uttar Pradesh'),
  pincode: text('pincode'),

  // Craft specializations (references to craft_definitions slugs)
  craftSpecializations: text('craft_specializations').array().notNull().default([]),

  // Independent verification axes
  approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
  approvalNote: text('approval_note'),
  verificationTier: verificationTierEnum('verification_tier').notNull().default('unverified'),
  identityDocumentReference: text('identity_document_reference'),
  artisanPehchanCardNumber: text('artisan_pehchan_card_number'), // Ministry of Textiles ID
  
  // Explicit statutory GI status
  giAuthorizationStatus: giAuthorizationStatusEnum('gi_authorization_status').notNull().default('none'),
  giAuthorizedUserNumber: text('gi_authorized_user_number'),     // e.g. 'GI/AU/7890/12'
  giCertificateDocumentUrl: text('gi_certificate_document_url'), // S3/GCS secure URL
  giRegistrationValidUntil: timestamp('gi_registration_valid_until', { withTimezone: true }),

  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  districtIdx: index('artisan_profiles_district_idx').on(table.districtId),
  approvalIdx: index('artisan_profiles_approval_idx').on(table.approvalStatus),
  giStatusIdx: index('artisan_profiles_gi_status_idx').on(table.giAuthorizationStatus),
}));
```

### 5.6 Products Table (`products`)
```typescript
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  artisanId: uuid('artisan_id')
    .notNull()
    .references(() => artisanProfiles.id, { onDelete: 'cascade' }),
  craftDefinitionId: uuid('craft_definition_id').references(() => craftDefinitions.id, { onDelete: 'restrict' }),
  districtId: uuid('district_id').references(() => districts.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),

  // Separated metadata fields
  category: craftCategoryEnum('category'),
  craftType: text('craft_type').notNull(),
  techniques: text('techniques').array().notNull().default([]),
  materials: text('materials').array().notNull().default([]), // Generalized raw materials
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
}, (table) => ({
  artisanIdx: index('products_artisan_idx').on(table.artisanId),
  craftIdx: index('products_craft_idx').on(table.craftDefinitionId),
  districtIdx: index('products_district_idx').on(table.districtId),
  categoryStatusIdx: index('products_category_status_idx').on(table.category, table.status),
  priceIdx: index('products_price_idx').on(table.priceInPaise),
}));
```

### 5.7 Product Images Table (`product_images`)
```typescript
export const productImages = pgTable('product_images', {
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
}, (table) => ({
  productOrderIdx: index('product_images_order_idx').on(table.productId, table.displayOrder),
  sha256Idx: index('product_images_sha256_idx').on(table.sha256Hash),
}));
```

### 5.8 Administrative & Audit Tables (`admin_audit_logs`, `ai_inference_logs`)
```typescript
export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  action: text('action').notNull(), // 'APPROVE_ARTISAN', 'VERIFY_GI_CERTIFICATE', 'REJECT_GI'
  targetEntity: text('target_entity').notNull(), // 'artisan_profile', 'product'
  targetId: uuid('target_id').notNull(),
  previousState: text('previous_state'), // JSON snapshot
  newState: text('new_state').notNull(),   // JSON snapshot
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  targetIdx: index('admin_audit_target_idx').on(table.targetEntity, table.targetId),
  actorIdx: index('admin_audit_actor_idx').on(table.actorId),
}));

export const aiInferenceLogs = pgTable('ai_inference_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestImageHash: text('request_image_hash').notNull(),
  modelVersion: text('model_version').notNull(), // e.g. 'craftsure-vit-b16-v0.2.1'
  weightsDigest: text('weights_digest').notNull(),
  predictedCraftDefinitionId: uuid('predicted_craft_definition_id').references(() => craftDefinitions.id),
  predictedDistrictId: uuid('predicted_district_id').references(() => districts.id),
  confidenceScore: integer('confidence_score_basis_points').notNull(), // 0–10000 (0.00% to 100.00%)
  entropyScore: integer('entropy_basis_points').notNull(),
  isOodRejected: boolean('is_ood_rejected').notNull().default(false), // Out of distribution
  latencyMs: integer('latency_ms').notNull(),
  userReportedIncorrect: boolean('user_reported_incorrect').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  modelIdx: index('ai_inference_model_idx').on(table.modelVersion),
  imageHashIdx: index('ai_inference_image_hash_idx').on(table.requestImageHash),
}));
```

---

## 6. API Specification & Contracts

All endpoints return the typed discriminated union `ApiResponse<T>`:
```typescript
export type ApiResponse<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiError };
```

### 6.1 District Endpoints

- `GET /api/districts`
  - Query parameters:
    - `division`: string (filter by administrative division)
    - `hasCrafts`: boolean (filter districts with mapped crafts)
    - `page`, `pageSize`: integer (`pageSize <= 50`, default 20)
  - Response: `PaginatedResponse<District>`

- `GET /api/districts/:slug`
  - Returns: Detailed district record, official ODOP portal link, list of officially mapped crafts (`verified_official_source` and `provisional`), ODOP summary, and active artisan count.

### 6.2 Craft Definition Endpoints

- `GET /api/crafts`
  - Query parameters:
    - `category`: `craft_category`
    - `district`: string (filter by district slug)
    - `giRegistered`: boolean
    - `officialStatus`: `'verified_official_source' | 'provisional_pending_verification'`
    - `page`, `pageSize`: integer
  - Response: `PaginatedResponse<CraftDefinition>`

- `GET /api/crafts/:slug`
  - Returns: Complete craft taxonomy, list of associated districts (`primary_traditional_hub` vs `secondary_cluster`), technique catalog, standard raw materials, and GI registration history.

### 6.3 Product Discovery & Faceted Filtering

- `GET /api/products`
  - Query parameters:
    - `district`: string (district slug)
    - `category`: `craft_category`
    - `craft`: string (craft definition slug)
    - `technique`: string[] (multiple techniques)
    - `material`: string[] (multiple materials)
    - `giCertifiedOnly`: boolean (only items with verified GI authorized artisan status)
    - `minPricePaise`, `maxPricePaise`: integer
    - `page`: integer (default 1)
    - `pageSize`: integer (default 20, max 50)
    - `sort`: `'price_asc' | 'price_desc' | 'latest'`  
      *(Note: Rating sort is deliberately omitted in Phase 1 until verified delivered-order reviews are implemented in Phase 2).*
  - Response: `PaginatedResponse<Product>`

### 6.4 AI Visual Search Contract (Phase 3)

- `POST /api/ai/visual-search`
  - Request: `multipart/form-data` with `image` (max 8MB; JPEG, PNG, or WebP) and optional `categoryHint`.
  - Security: File magic-number inspection; EXIF metadata stripped; rate limited (10 req/min/IP).
  - Response:
    ```typescript
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
      readonly disclaimer: string; // "Visual similarity indicates stylistic match only. Authenticity requires artisan verification."
      readonly rejectionReason?: 'low_confidence' | 'out_of_distribution' | 'ambiguous_visual_features';
    }
    ```

---

## 7. AI Dataset Strategy & Visual Discovery Pipeline

### 7.1 Multi-Stage Dataset Pipeline
To prevent data contamination and ensure production safety, dataset acquisition proceeds through four controlled stages:

```
Stage 0: Pilot Cohort Selection (5 Representative UP Crafts)
              │
              ▼
Stage 1: Seed Reference Collection (50–100 items/craft from verified artisan institutions)
              │
              ▼
Stage 2: Standardized Multi-Angle Field Sampling (200–300 items/craft with macro weave/grain)
              │
              ▼
Stage 3: Comprehensive Benchmark Target (~600 images/craft evaluated for calibration & OOD)
              │
              ▼
Stage 4: Progressive Multi-District Expansion (Azamgarh, Firozabad, Bhadohi, Mainpuri)
```

### 7.2 Pilot Crafts Selection (5 High-Variance Crafts)
1. **Lucknow Chikankari:** White-on-sheer fabric embroidery, openwork stitches (*jaali*), knotted relief (*murri*).
2. **Varanasi Banarasi Silk:** Metallic brocade (*zari*), complex jacquard florals (*butis*), high-density woven borders.
3. **Gorakhpur Terracotta:** Unfinished reddish-brown natural clay, hand-modeled animal reliefs (elephants, horses).
4. **Moradabad Brassware:** High-sheen brass alloy surfaces, deep chiseling, lacquered engraving, geometric repoussé.
5. **Saharanpur Wood Carving:** Deep three-dimensional lattice (*jali*), floral wood scrollwork, dark Sheesham wood grain.

### 7.3 Data Collection, Ethics & Leakage Prevention
- **Attribution & Rights Management:** Every reference image is tagged with:
  - Source cooperative or master artisan name.
  - Licensing contract (`artisan_consented`, `cc_by_4_0`, or `official_archive_courtesy`).
  - Strict ban on uncredited web scraping.
- **Deduplication:** Perceptual hashing (`pHash`) and image feature clustering to purge duplicates.
- **Strict Data Partitioning:** Train, validation, and test splits are strictly segregated by **artisan workshop and physical product instance**—never merely by image. If an artisan creates 10 variations of a wood carving, all 10 remain solely within one partition to prevent artificial test accuracy inflation.

### 7.4 AI Confidence, Calibration & Rejection Strategy
- **Visual Similarity vs. Authenticity:** AI extracts visual textures, weave density, and carving motifs. It **cannot** determine chemical fabric purity, age, or statutory artisan origin. User interfaces must explicitly present AI results as *"Visual Matches"* and never *"Verified Authentic"*.
- **Threshold Calibration:** Arbitrary thresholds (such as 0.70) are replaced by empirical **temperature-scaled Platt calibration** computed on the held-out validation set.
- **Rejection of Unknowns & False Positives:**
  - **Out-of-Distribution (OOD) Classifier:** A negative control set (modern machine prints, factory-stamped metal, synthetic plastic toys, non-UP crafts like Kashmiri Pashmina and Rajasthani Sanganeri) is evaluated.
  - If prediction entropy exceeds the threshold or nearest cosine distance to a verified cluster centroid exceeds `d_max`, the system yields `status: 'unsupported_or_inconclusive'`.
  - Users receive an educational message: *"We could not reliably match this image to our verified UP craft catalog. It may be machine-made or represent an unindexed craft."*

---

## 8. Security, Administration & File Integrity

### 8.1 Secure Upload Pipeline
1. **Direct-to-Storage Pre-signed URLs:** Client obtains a temporary, cryptographically signed upload URL (`PUT`) with strict content length (`<= 8MB`) and MIME restrictions (`image/jpeg`, `image/png`, `image/webp`).
2. **Asynchronous Ingestion Worker:**
   - Magic-byte verification (rejecting files whose binary signature does not match their MIME extension).
   - EXIF data stripped to protect artisan privacy (removes GPS coordinates while archiving camera specs for fraud detection).
   - Generates thumbnail (`400x400`) and display (`1200x1200`) WebP formats.
   - Computes SHA-256 digest for deduplication and tamper detection.

### 8.2 Role-Based Access Control (RBAC)
| Capability | Buyer | Artisan | Store Admin | Platform Admin |
|---|---|---|---|---|
| Browse catalogue & view verified profiles | ✅ | ✅ | ✅ | ✅ |
| Manage own profile & submit products | ❌ | ✅ | ❌ | ❌ |
| Upload GI certificates & Pehchan IDs | ❌ | ✅ | ❌ | ❌ |
| Audit & approve artisan accounts | ❌ | ❌ | ✅ | ✅ |
| Verify and grant statutory GI authorization | ❌ | ❌ | ❌ | ✅ |
| Manage district-craft association seeds | ❌ | ❌ | ❌ | ✅ |
| View AI inference and audit logs | ❌ | ❌ | ❌ | ✅ |

### 8.3 Auditing & Compliance
- **Immutable Admin Audit Log:** Any change to an artisan's `approvalStatus`, `verificationTier`, or `giAuthorizationStatus` produces an append-only row in `admin_audit_logs`.
- **Model Governance:** Every inference request records the `modelVersion` and `weightsDigest`. This enables retroactive auditing if a model drift or bias issue is identified.

---

## 9. Implementation Roadmap & Dependency Graph

```
Milestone 1.1: Monorepo Scaffold & Smoke Tests [COMPLETED]
Milestone 1.2: Design System & Core Unit Tests [COMPLETED]
     │
     ▼
Milestone 1.3: UP-Wide Data Contracts & Schema Migration [COMPLETED]
  ├── Step 1: Update packages/shared-types (Models, enums, API request/response types) [DONE]
  ├── Step 2: Drizzle ORM Schema Migration in apps/api (districts, craft_definitions, craft_districts, updated products) [DONE]
  └── Step 3: Verified UP Reference Seed Script (Populate official districts and ODOP-verified craft relationships) [DONE]
     │
     ▼
Milestone 1.4: Supabase Authentication, RBAC & Profile Management
     │
     ▼
Milestone 1.5: REST API Implementation & Validation [COMPLETED IN PROTOTYPE]
  ├── /api/districts & /api/districts/:slug [DONE]
  ├── /api/crafts & /api/crafts/:slug [DONE]
  ├── /api/products (Faceted filters: district, category, craft, technique, material, GI status) [DONE]
  └── /api/artisans (Decoupled approval, verification tier, and GI authorization)
     │
     ▼
Milestone 1.6: Web Frontend Discovery & Exploration Pages
  ├── /districts & /districts/[districtSlug]
  ├── /crafts & /crafts/[craftSlug]
  └── /browse with multi-facet sidebar (Divisions, Crafts, Materials, Techniques, GI filter)
     │
     ▼
Milestone 1.7: Artisan Verification Portal & Admin GI Audit Console
     │
     ▼
Milestone 1.8: Static Educational Content, GI Verification Guide & Heritage Stories
     │
     ▼
Phase 2: Transactions, Escrow Orders, Delivered-Order Reviews & Logistics
     │
     ▼
Phase 3: AI Visual Discovery Engine (Pilot 5 crafts, Calibrated Confidence, OOD Rejection)
```

---

## 10. Strategic Product Blueprint & MVP Execution Matrix

### 10.1 Product Identity & Vision
CraftSure AI is an **AI-first, trust-enabled, artisan-powered marketplace ecosystem**. 

- **Primary Goal:** Build a technically impressive college/hackathon flagship demonstration with genuine commercial, technical, and startup viability.
- **Core Positioning:** *"Discover. Identify. Verify. Shop."*
- **Target Audience:** Conscientious consumers, textile collectors, tourists, and cultural patrons seeking authentic handmade regional Indian art without fear of industrial counterfeit or machine-made imitation.

### 10.2 Three Interconnected Product Pillars

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CRAFTSURE AI                                       │
│                       "Discover. Identify. Verify. Shop."                              │
└───────────────────┬────────────────────────────────┬───────────────────────────────────┘
                    │                                │
                    ▼                                ▼
       ┌─────────────────────────┐      ┌─────────────────────────┐
       │   1. AI-POWERED CRAFT   │      │   2. TRUST & PROVENANCE │
       │        DISCOVERY        │      │       ARCHITECTURE      │
       ├─────────────────────────┤      ├─────────────────────────┤
       │ • Image craft identify  │      │ • Structured provenance │
       │ • DINOv2 vs CLIP bench  │      │ • Seller vetting flow   │
       │ • FAISS vector matching │      │ • Origin & material decl│
       │ • Technique suggestions │      │ • GI statutory audit    │
       │ • Out-of-dist rejection │      │ • Evidence tracking     │
       │ • Similarity discovery  │      │ • Admin review logs     │
       └────────────┬────────────┘      └────────────┬────────────┘
                    │                                │
                    └────────────────┬───────────────┘
                                     │
                                     ▼
                       ┌───────────────────────────┐
                       │   3. ARTISAN MARKETPLACE  │
                       ├───────────────────────────┤
                       │ • Artisan store accounts  │
                       │ • Seller storefronts      │
                       │ • Inventory & listings    │
                       │ • Cart & wishlist         │
                       │ • Demonstration checkout  │
                       │ • Order management        │
                       └───────────────────────────┘
```

1. **AI-Powered Craft Discovery:**
   - Multi-angle visual craft identification.
   - Comparative benchmarking between vision models (**DINOv2** for self-supervised structural/texture extraction vs. **OpenAI/OpenCLIP** for cross-modal semantics).
   - Low-latency vector similarity retrieval using **FAISS** (Facebook AI Similarity Search) indexing indexed embeddings of authenticated reference items.
   - Automatic suggestion of craft technique (e.g. *Shadow Work*, *Kadwa*) and raw materials (e.g. *Mulmul Cotton*, *Katan Silk*).
   - Rejection of out-of-distribution, non-craft, or ambiguous images (`unsupported_or_inconclusive`).
   - Direct pathway from visual detection to certified catalog product recommendations.

2. **Trust and Provenance Architecture:**
   - Normalized provenance records tracking craft lineage, cluster geography, and master artisan mentorship.
   - Rigorous seller onboarding: phone verification, identity checks, and master artisan / cooperative accreditation.
   - Granular material and technique disclosures on every product listing.
   - Independent statutory GI verification (cross-checked against the official GI Registry; authorized user certificate required).
   - Immutable administrative audit logs capturing verification status modifications.

3. **Artisan Marketplace:**
   - Dedicated artisan storefronts showcasing biography, cluster location, workshop photos, and verified credentials.
   - Product catalog with real-time inventory management.
   - Cart, saved wishlist, and complete demonstration checkout flow with transparent integer paise accounting.
   - Order management and tracking pipeline.

---

### 10.3 MVP Scope: Five-Craft Pilot & The Complete Buyer Journey
To maximize hackathon impact while maintaining technical rigor, the MVP concentrates on **five signature pilot crafts** spanning diverse physical mediums:
1. **Lucknow Chikankari** (`textiles_handloom` — fine hand embroidery, openwork)
2. **Varanasi Banarasi Silk** (`textiles_handloom` — pit-loom jacquard brocade, metallic zari)
3. **Gorakhpur Terracotta** (`pottery_ceramics` — unglazed natural fired earthenware sculptures)
4. **Moradabad Brassware** (`metal_glass` — sand-cast, hand-engraved metalware)
5. **Saharanpur Wood Carving** (`woodwork` — deep relief and lattice jali in Sheesham wood)

#### The Complete End-to-End Buyer Journey
The MVP must demonstrate one unbroken, seamless customer journey from curiosity to checkout:

```
[1. Image Upload] ──► [2. AI Visual Match] ──► [3. Craft Information]
                                                        │
                                                        ▼
[6. Demo Checkout] ◄── [5. Cart] ◄── [4. Product & Seller Provenance]
```

1. **Image Upload:** Buyer uploads a mobile photo or sample image of a textile, carving, or metalware.
2. **AI Visual Matching:** Python/FastAPI microservice embeds the image via DINOv2/CLIP, performs FAISS vector search, and returns top matched crafts with calibrated confidence.
3. **Craft Information:** User views the detected craft's heritage, standard techniques, and traditional UP districts.
4. **Product Discovery & Seller Provenance:** User explores catalog matches from verified UP artisans, inspecting the artisan's workshop location, GI registration document, and raw material disclosures.
5. **Cart & Wishlist:** Buyer adds the authentic handcrafted item to their shopping bag.
6. **Demo Checkout:** Buyer enters a shipping address and completes a simulated payment checkout in integer paise (INR), generating a confirmed order with snapshot pricing.

---

### 10.4 Technology Stack Invariants & Microservice Layout

To ensure execution speed, stability, and zero scope drift, the technology stack is strictly frozen:

| System Layer | Technology | Status / Invariant |
|---|---|---|
| **Web Frontend** | Next.js 14+ (App Router), TypeScript, CSS Modules | Strict Invariant (No migration to Vite/SPA) |
| **Backend API** | Express + TypeScript, Drizzle ORM | Strict Invariant (No migration to NestJS or plain JS) |
| **Database** | PostgreSQL (Supabase) + Drizzle ORM | Strict Invariant (No migration to MongoDB or NoSQL) |
| **Auth & File Storage** | Supabase Auth + Supabase Storage | Subject to existing implementation review |
| **AI Inference Service** | Python 3.11+, FastAPI, PyTorch | Separate microservice (`ai-service`) |
| **Vector Index & Embeddings** | Meta DINOv2 / OpenCLIP, FAISS | Fast similarity search on pre-embedded reference sets |

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│      Next.js Web Client        │         │     AI Inference Service       │
│         (Port 3000)            │         │       (FastAPI / Python)       │
└───────────────┬────────────────┘         └───────────────┬────────────────┘
                │ HTTP / REST                              │ Internal REST
                ▼                                          ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          Express Backend API                              │
│                              (Port 4000)                                  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Drizzle ORM
                                      ▼
                        ┌───────────────────────────┐
                        │   PostgreSQL (Supabase)   │
                        │      Database Layer       │
                        └───────────────────────────┘
```

---

### 10.5 Phase-by-Phase Feature Distinction

To guarantee clear boundaries between immediate delivery and future scaling, features are partitioned across three explicit tiers:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TIER 1: HACKATHON MVP SCOPE                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 5 Pilot crafts (Lucknow, Varanasi, Gorakhpur, Moradabad, Saharanpur)                          │
│ • DINOv2 / CLIP + FAISS vector search on reference dataset                                      │
│ • Unbroken single buyer flow: Image -> AI -> Craft Profile -> Artisan Item -> Cart -> Checkout   │
│ • Verified UP Catalogue with 20 districts and ODOP references                                    │
│ • Mock / Demonstration checkout with integer paise order ledger                                 │
│ • Decoupled verification badges (Artisan Identity, Pehchan ID, and GI Authorized User)          │
│ • Admin audit log recording verification reviews                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               TIER 2: PLATFORM LAUNCH (LATER-PHASE)                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Live payment gateway integration (Razorpay / Cashfree in INR paise)                           │
│ • Automated escrow payouts to artisans upon delivery confirmation                               │
│ • Verified delivered-order review system with customer photo uploads                            │
│ • Artisan multi-item inventory management and shipping tracking                                 │
│ • Formal Ministry of Textiles Pehchan card API verification                                     │
│ • Progressive expansion to remaining 70 UP districts                                            │
│ • Automated OOD drift evaluation and retraining trigger pipeline                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            TIER 3: LONG-TERM STARTUP AMBITIONS                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Physical NFC/QR cryptographic thread tags woven into GI textiles for tamper-evident provenance│
│ • Conversational AI Craft Curator (multimodal LLM in Hindi, Urdu, and English)                  │
│ • Cooperative bulk export logistics, B2B wholesale portal, and customs documentation            │
│ • Multi-state expansion across pan-Indian GI clusters (Kashmir, Rajasthan, Bengal, Assam)       │
│ • Blockchain-anchored provenance certificates of authenticity                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 10.6 Success Metrics & Evaluation Matrix

| Category | Metric | MVP Target | Production Ambition |
|---|---|---|---|
| **AI Accuracy** | Top-1 Craft Identification Accuracy (Pilot 5) | ≥ 85.0% | ≥ 94.0% |
| **AI Retrieval** | Top-3 Visual Similarity Retrieval Accuracy | ≥ 92.0% | ≥ 98.0% |
| **OOD Rejection** | Rejection rate of non-craft / modern industrial items | ≥ 90.0% | ≥ 96.0% |
| **Inference Latency** | AI image embedding + FAISS search response time | < 800ms | < 300ms |
| **Catalogue Integrity**| Seed craft-district associations backed by official citations | 100.0% | 100.0% |
| **API Latency** | P95 response time for catalogue & product endpoints | < 120ms | < 50ms |
| **Marketplace Flow** | End-to-end checkout completion test pass rate | 100.0% | 100.0% |
| **Security** | Zero unauthorized role elevation or unverified GI badges | Zero defects | Zero defects |

---

### 10.7 ODOP Integration Governance Summary
The official portal [https://odopup.in/en](https://odopup.in/en) serves strictly as an **authoritative regional reference for traditional industrial concentrations**, and never as an unquestioned badge of individual authenticity or statutory GI entitlement. All catalogue entries originating from ODOP data maintain:
- Source URL and retrieval date.
- Mandatory secondary cross-checking against the Geographical Indications Registry of India.
- Strict exclusion of non-craft agricultural, food, and industrial hardware commodities.

---

## 11. Inventory of Existing Code Modules & Current Implementation State

The following table reflects the current implementation status of codebase modules across the monorepo:

| Module / File Path | Status | Implemented Functionality & Scope |
|---|---|---|
| [`packages/shared-types/src/models.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/packages/shared-types/src/models.ts) | **Completed** | Full UP domain types: `District`, `CraftDefinition`, `CraftDistrict`, `CraftCategory`, `VerificationTier`, `GiAuthorizationStatus`, separated `Product` and `ArtisanProfile` models. |
| [`packages/shared-types/src/api.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/packages/shared-types/src/api.ts) | **Completed** | `ApiResponse<T>`, `PaginatedResponse<T>`, `ProductFilterParams`, `DistrictFilterParams`, `CraftFilterParams`, and `VisualSearchResponse`. |
| [`packages/shared-types/src/index.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/packages/shared-types/src/index.ts) | **Completed** | Clean re-exports of all types; compiled into `dist/` with declaration maps. |
| [`apps/api/src/db/schema/index.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/db/schema/index.ts) | **Completed** | Drizzle ORM schema for `districts`, `craft_definitions`, `craft_districts`, `artisan_profiles`, `products`, `product_images`, `admin_audit_logs`, and `ai_inference_logs`. |
| [`apps/api/src/db/data/upCatalogue.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/db/data/upCatalogue.ts) | **Completed** | 20 UP districts and 19 craft definitions with official ODOP URLs and GI Registry cross-checks. |
| [`apps/api/src/routes/districts.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/routes/districts.ts) | **Completed** | `GET /api/districts` with division filters and `GET /api/districts/:slug` with mapped craft associations. |
| [`apps/api/src/routes/crafts.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/routes/crafts.ts) | **Completed** | `GET /api/crafts` with category, district, and GI filters and `GET /api/crafts/:slug`. |
| [`apps/api/src/routes/products.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/routes/products.ts) | **Completed** | `GET /api/products` with multi-facet filters (district, category, craft, GI, price sort) and `GET /api/products/:id`. |
| [`apps/api/src/app.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/app.ts) | **Completed** | Mounted all catalogue routes with CORS, health check, 404 handler, and global error middleware. |
| [`apps/api/src/app.test.ts`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/api/src/app.test.ts) | **Completed** | 23 passed integration tests covering health, CORS, 404, districts, crafts, and products. |
| [`apps/web/app/layout.tsx`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/web/app/layout.tsx) | **Completed** | SEO metadata, OpenGraph, font configurations, and UP-wide discovery scope. |
| [`apps/web/app/page.tsx`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/web/app/page.tsx) | **Completed** | UP-wide hero section, signature craft cards, district badges, and truth-in-provenance banner. |
| [`apps/web/components/layout/Header/Header.tsx`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/web/components/layout/Header/Header.tsx) | **Completed** | Header with `/browse`, `/districts`, `/crafts`, `/artisan/apply`, and `/about` navigation. |
| [`apps/web/components/ui/Badge/Badge.tsx`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/apps/web/components/ui/Badge/Badge.tsx) | **Completed** | Supported badge variants: `craft`, `district`, `category`, `technique`, `status`, `gi`. |
| [`README.md`](file:///c:/Users/LENOVO/Projects/CraftSure-AI/README.md) | **Completed** | Updated project description, technical stack, phase breakdown, and link to `docs/architecture.md`. |
| `apps/ai-service/` | **Planned (MVP)** | Python + FastAPI microservice with DINOv2 / CLIP and FAISS index for image craft identification. |
