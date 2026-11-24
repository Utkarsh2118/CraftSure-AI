CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."association_type" AS ENUM('primary_traditional_hub', 'secondary_cluster', 'historical_spread');--> statement-breakpoint
CREATE TYPE "public"."craft_category" AS ENUM('textiles_handloom', 'metal_glass', 'woodwork', 'pottery_ceramics', 'natural_fibre', 'stone_inlay', 'leather_craft', 'other');--> statement-breakpoint
CREATE TYPE "public"."craft_type" AS ENUM('chikankari', 'zardozi', 'kashida', 'phulkari');--> statement-breakpoint
CREATE TYPE "public"."gi_authorization_status" AS ENUM('none', 'applied', 'submitted_for_review', 'gi_authorized_user', 'rejected', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."official_source_status" AS ENUM('verified_official_source', 'provisional_pending_verification');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'out_of_stock', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'artisan', 'store_admin', 'platform_admin');--> statement-breakpoint
CREATE TYPE "public"."verification_tier" AS ENUM('unverified', 'phone_verified', 'identity_verified', 'master_craftsperson');--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_entity" text NOT NULL,
	"target_id" uuid NOT NULL,
	"previous_state" text,
	"new_state" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_inference_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_image_hash" text NOT NULL,
	"model_version" text NOT NULL,
	"weights_digest" text NOT NULL,
	"predicted_craft_definition_id" uuid,
	"predicted_district_id" uuid,
	"confidence_score_basis_points" integer NOT NULL,
	"entropy_basis_points" integer NOT NULL,
	"is_ood_rejected" boolean DEFAULT false NOT NULL,
	"latency_ms" integer NOT NULL,
	"user_reported_incorrect" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artisan_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"shop_name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"district_id" uuid,
	"cluster_or_village" text,
	"tehsil" text,
	"location_city" text NOT NULL,
	"location_state" text DEFAULT 'Uttar Pradesh' NOT NULL,
	"pincode" text,
	"craft_specializations" text[] DEFAULT '{}' NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"approval_note" text,
	"verification_tier" "verification_tier" DEFAULT 'unverified' NOT NULL,
	"artisan_pehchan_card_number" text,
	"gi_authorization_status" "gi_authorization_status" DEFAULT 'none' NOT NULL,
	"gi_authorized_user_number" text,
	"gi_certificate_document_url" text,
	"gi_certificate_url" text,
	"gi_registration_valid_until" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "artisan_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "craft_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "craft_category" NOT NULL,
	"gi_registered" boolean DEFAULT false NOT NULL,
	"gi_registration_number" text,
	"gi_registration_year" integer,
	"description" text NOT NULL,
	"historical_context" text DEFAULT '' NOT NULL,
	"standard_techniques" text[] DEFAULT '{}' NOT NULL,
	"typical_materials" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "craft_definitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "craft_districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"craft_definition_id" uuid NOT NULL,
	"district_id" uuid NOT NULL,
	"association_type" "association_type" DEFAULT 'primary_traditional_hub' NOT NULL,
	"official_source_status" "official_source_status" DEFAULT 'provisional_pending_verification' NOT NULL,
	"source_title" text NOT NULL,
	"source_url" text NOT NULL,
	"retrieval_date" timestamp with time zone DEFAULT now() NOT NULL,
	"source_citation" text NOT NULL,
	"source_document_url" text,
	"is_odop_recognized" boolean DEFAULT false NOT NULL,
	"flagged_for_manual_review" boolean DEFAULT false NOT NULL,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"division" text NOT NULL,
	"state" text DEFAULT 'Uttar Pradesh' NOT NULL,
	"hero_image_url" text,
	"overview" text DEFAULT '' NOT NULL,
	"odop_portal_url" text NOT NULL,
	"odop_focal_crafts" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"alt_text" text DEFAULT '' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"media_rights_holder" text,
	"license_type" text DEFAULT 'artisan_uploaded' NOT NULL,
	"sha256_hash" text,
	"file_size_bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artisan_id" uuid NOT NULL,
	"craft_definition_id" uuid,
	"district_id" uuid,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" "craft_category",
	"craft_type" text NOT NULL,
	"techniques" text[] DEFAULT '{}' NOT NULL,
	"materials" text[] DEFAULT '{}' NOT NULL,
	"fabric" text,
	"origin_cluster" text,
	"origin_district" text,
	"is_gi_craft_item" boolean DEFAULT false NOT NULL,
	"gi_batch_reference" text,
	"source_organization" text,
	"license_type" text DEFAULT 'artisan_commercial' NOT NULL,
	"attribution_text" text,
	"price_in_paise" integer NOT NULL,
	"stock_count" integer DEFAULT 0 NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'buyer' NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_inference_logs" ADD CONSTRAINT "ai_inference_logs_predicted_craft_definition_id_craft_definitions_id_fk" FOREIGN KEY ("predicted_craft_definition_id") REFERENCES "public"."craft_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_inference_logs" ADD CONSTRAINT "ai_inference_logs_predicted_district_id_districts_id_fk" FOREIGN KEY ("predicted_district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artisan_profiles" ADD CONSTRAINT "artisan_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artisan_profiles" ADD CONSTRAINT "artisan_profiles_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "craft_districts" ADD CONSTRAINT "craft_districts_craft_definition_id_craft_definitions_id_fk" FOREIGN KEY ("craft_definition_id") REFERENCES "public"."craft_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "craft_districts" ADD CONSTRAINT "craft_districts_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_artisan_id_artisan_profiles_id_fk" FOREIGN KEY ("artisan_id") REFERENCES "public"."artisan_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_craft_definition_id_craft_definitions_id_fk" FOREIGN KEY ("craft_definition_id") REFERENCES "public"."craft_definitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_target_idx" ON "admin_audit_logs" USING btree ("target_entity","target_id");--> statement-breakpoint
CREATE INDEX "admin_audit_actor_idx" ON "admin_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "ai_inference_model_idx" ON "ai_inference_logs" USING btree ("model_version");--> statement-breakpoint
CREATE INDEX "ai_inference_image_hash_idx" ON "ai_inference_logs" USING btree ("request_image_hash");--> statement-breakpoint
CREATE INDEX "artisan_profiles_district_idx" ON "artisan_profiles" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "artisan_profiles_approval_idx" ON "artisan_profiles" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "artisan_profiles_gi_status_idx" ON "artisan_profiles" USING btree ("gi_authorization_status");--> statement-breakpoint
CREATE UNIQUE INDEX "craft_definitions_slug_idx" ON "craft_definitions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "craft_definitions_category_idx" ON "craft_definitions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "craft_definitions_gi_idx" ON "craft_definitions" USING btree ("gi_registered");--> statement-breakpoint
CREATE UNIQUE INDEX "craft_districts_composite_idx" ON "craft_districts" USING btree ("craft_definition_id","district_id");--> statement-breakpoint
CREATE INDEX "craft_districts_district_idx" ON "craft_districts" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "craft_districts_craft_idx" ON "craft_districts" USING btree ("craft_definition_id");--> statement-breakpoint
CREATE INDEX "craft_districts_status_idx" ON "craft_districts" USING btree ("official_source_status");--> statement-breakpoint
CREATE INDEX "craft_districts_review_idx" ON "craft_districts" USING btree ("flagged_for_manual_review");--> statement-breakpoint
CREATE UNIQUE INDEX "districts_slug_idx" ON "districts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "districts_division_idx" ON "districts" USING btree ("division");--> statement-breakpoint
CREATE INDEX "districts_is_active_idx" ON "districts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "product_images_order_idx" ON "product_images" USING btree ("product_id","display_order");--> statement-breakpoint
CREATE INDEX "product_images_sha256_idx" ON "product_images" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "products_artisan_idx" ON "products" USING btree ("artisan_id");--> statement-breakpoint
CREATE INDEX "products_craft_idx" ON "products" USING btree ("craft_definition_id");--> statement-breakpoint
CREATE INDEX "products_district_idx" ON "products" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "products_category_status_idx" ON "products" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price_in_paise");