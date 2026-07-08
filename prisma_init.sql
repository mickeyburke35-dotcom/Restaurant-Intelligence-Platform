-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AgencyPlan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewSourceType" AS ENUM ('GOOGLE_BUSINESS_PROFILE', 'YELP_FUSION', 'TRIPADVISOR', 'FACEBOOK', 'CSV_IMPORT', 'MANUAL_ENTRY', 'PARTNER_API', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceApprovalStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewSourceConnectionStatus" AS ENUM ('NOT_CONNECTED', 'CONNECTED', 'SYNCING', 'PAUSED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('REVIEW_SUMMARY', 'SENTIMENT_TREND', 'THEME', 'RISK', 'OPPORTUNITY', 'COMPETITOR_COMPARISON', 'RECOMMENDATION', 'REPORT_NARRATIVE');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InsightStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CompetitorStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CompetitorObservationType" AS ENUM ('RATING_SNAPSHOT', 'REVIEW_VOLUME', 'REVIEW_THEME', 'MENU_CHANGE', 'PRICING_SIGNAL', 'PROMOTION', 'HOURS_CHANGE', 'MARKET_NOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'CSV');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'QUEUED', 'GENERATING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScheduledJobType" AS ENUM ('REVIEW_SYNC', 'COMPETITOR_OBSERVATION_SYNC', 'INSIGHT_GENERATION', 'REPORT_GENERATION', 'SOURCE_HEALTH_CHECK', 'DATA_RETENTION');

-- CreateEnum
CREATE TYPE "ScheduledJobStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('AGENCY', 'USER', 'MEMBERSHIP', 'RESTAURANT', 'LOCATION', 'REVIEW_SOURCE', 'REVIEW', 'INSIGHT', 'COMPETITOR', 'COMPETITOR_OBSERVATION', 'REPORT', 'SCHEDULED_JOB');

-- CreateTable
CREATE TABLE "agencies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "AgencyPlan" NOT NULL DEFAULT 'STARTER',
    "status" "AgencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "auth_provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
    "external_auth_id" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_sign_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "invited_by_user_id" UUID,
    "restaurant_id" UUID,
    "role" "MembershipRole" NOT NULL DEFAULT 'VIEWER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "invited_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "segment" TEXT,
    "cuisine" TEXT,
    "website_url" VARCHAR(2048),
    "notes" TEXT,
    "status" "RestaurantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "LocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_sources" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID,
    "location_id" UUID,
    "name" TEXT NOT NULL,
    "source_type" "ReviewSourceType" NOT NULL,
    "approval_status" "SourceApprovalStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "connection_status" "ReviewSourceConnectionStatus" NOT NULL DEFAULT 'NOT_CONNECTED',
    "external_account_id" TEXT,
    "external_location_id" TEXT,
    "permission_notes" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "next_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "review_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "review_source_id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "rating" DECIMAL(3,2),
    "title" TEXT,
    "text" TEXT,
    "language" TEXT,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'UNKNOWN',
    "sentiment_score" DECIMAL(5,4),
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "author_display_name_hash" TEXT,
    "review_url" VARCHAR(2048),
    "source_payload_hash" TEXT,
    "metadata" JSONB,
    "published_at" TIMESTAMP(3) NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "location_id" UUID,
    "created_by_user_id" UUID,
    "reviewed_by_user_id" UUID,
    "type" "InsightType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'UNKNOWN',
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DECIMAL(5,4),
    "confidence_level" "ConfidenceLevel",
    "model" TEXT NOT NULL,
    "prompt_version" TEXT,
    "source_review_count" INTEGER NOT NULL DEFAULT 0,
    "high_impact" BOOLEAN NOT NULL DEFAULT false,
    "status" "InsightStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_source_reviews" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "insight_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "relevance_score" DECIMAL(5,4),
    "evidence_excerpt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insight_source_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "location_id" UUID,
    "name" TEXT NOT NULL,
    "source_url" VARCHAR(2048),
    "notes" TEXT,
    "status" "CompetitorStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_observations" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "competitor_id" UUID NOT NULL,
    "signal_type" "CompetitorObservationType" NOT NULL,
    "value" TEXT NOT NULL,
    "numeric_value" DECIMAL(10,2),
    "source_url" VARCHAR(2048),
    "metadata" JSONB,
    "observed_at" TIMESTAMP(3) NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "competitor_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "location_id" UUID,
    "created_by_user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "date_range_start" TIMESTAMP(3) NOT NULL,
    "date_range_end" TIMESTAMP(3) NOT NULL,
    "approved_only" BOOLEAN NOT NULL DEFAULT true,
    "filters" JSONB,
    "sections" JSONB,
    "file_url" VARCHAR(2048),
    "storage_key" TEXT,
    "generated_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_jobs" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "restaurant_id" UUID,
    "location_id" UUID,
    "review_source_id" UUID,
    "job_type" "ScheduledJobType" NOT NULL,
    "status" "ScheduledJobStatus" NOT NULL DEFAULT 'SCHEDULED',
    "schedule" TEXT,
    "payload" JSONB,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "lock_expires_at" TIMESTAMP(3),
    "locked_by" TEXT,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "agency_id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" "AuditEntityType" NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB,
    "ip_hash" TEXT,
    "user_agent_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agencies_slug_key" ON "agencies"("slug");

-- CreateIndex
CREATE INDEX "agencies_status_idx" ON "agencies"("status");

-- CreateIndex
CREATE INDEX "agencies_deleted_at_idx" ON "agencies"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_external_auth_id_key" ON "users"("auth_provider", "external_auth_id");

-- CreateIndex
CREATE INDEX "memberships_agency_id_role_status_idx" ON "memberships"("agency_id", "role", "status");

-- CreateIndex
CREATE INDEX "memberships_agency_id_restaurant_id_idx" ON "memberships"("agency_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE INDEX "memberships_deleted_at_idx" ON "memberships"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_agency_id_user_id_key" ON "memberships"("agency_id", "user_id");

-- CreateIndex
CREATE INDEX "restaurants_agency_id_status_idx" ON "restaurants"("agency_id", "status");

-- CreateIndex
CREATE INDEX "restaurants_agency_id_deleted_at_idx" ON "restaurants"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_id_agency_id_key" ON "restaurants"("id", "agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_agency_id_slug_key" ON "restaurants"("agency_id", "slug");

-- CreateIndex
CREATE INDEX "locations_agency_id_restaurant_id_status_idx" ON "locations"("agency_id", "restaurant_id", "status");

-- CreateIndex
CREATE INDEX "locations_agency_id_city_region_idx" ON "locations"("agency_id", "city", "region");

-- CreateIndex
CREATE INDEX "locations_agency_id_deleted_at_idx" ON "locations"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "locations_id_agency_id_key" ON "locations"("id", "agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "locations_agency_id_restaurant_id_name_key" ON "locations"("agency_id", "restaurant_id", "name");

-- CreateIndex
CREATE INDEX "review_sources_agency_id_restaurant_id_idx" ON "review_sources"("agency_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "review_sources_agency_id_location_id_idx" ON "review_sources"("agency_id", "location_id");

-- CreateIndex
CREATE INDEX "review_sources_agency_id_source_type_connection_status_idx" ON "review_sources"("agency_id", "source_type", "connection_status");

-- CreateIndex
CREATE INDEX "review_sources_agency_id_approval_status_idx" ON "review_sources"("agency_id", "approval_status");

-- CreateIndex
CREATE INDEX "review_sources_agency_id_deleted_at_idx" ON "review_sources"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_sources_id_agency_id_key" ON "review_sources"("id", "agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_sources_agency_id_source_type_external_location_id_key" ON "review_sources"("agency_id", "source_type", "external_location_id");

-- CreateIndex
CREATE INDEX "reviews_agency_id_restaurant_id_published_at_idx" ON "reviews"("agency_id", "restaurant_id", "published_at");

-- CreateIndex
CREATE INDEX "reviews_agency_id_location_id_published_at_idx" ON "reviews"("agency_id", "location_id", "published_at");

-- CreateIndex
CREATE INDEX "reviews_agency_id_review_source_id_idx" ON "reviews"("agency_id", "review_source_id");

-- CreateIndex
CREATE INDEX "reviews_agency_id_sentiment_idx" ON "reviews"("agency_id", "sentiment");

-- CreateIndex
CREATE INDEX "reviews_agency_id_rating_idx" ON "reviews"("agency_id", "rating");

-- CreateIndex
CREATE INDEX "reviews_agency_id_deleted_at_idx" ON "reviews"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_id_agency_id_key" ON "reviews"("id", "agency_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_agency_id_review_source_id_external_id_key" ON "reviews"("agency_id", "review_source_id", "external_id");

-- CreateIndex
CREATE INDEX "insights_agency_id_restaurant_id_status_created_at_idx" ON "insights"("agency_id", "restaurant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "insights_agency_id_location_id_idx" ON "insights"("agency_id", "location_id");

-- CreateIndex
CREATE INDEX "insights_agency_id_type_idx" ON "insights"("agency_id", "type");

-- CreateIndex
CREATE INDEX "insights_agency_id_high_impact_status_idx" ON "insights"("agency_id", "high_impact", "status");

-- CreateIndex
CREATE INDEX "insights_created_by_user_id_idx" ON "insights"("created_by_user_id");

-- CreateIndex
CREATE INDEX "insights_reviewed_by_user_id_idx" ON "insights"("reviewed_by_user_id");

-- CreateIndex
CREATE INDEX "insights_agency_id_deleted_at_idx" ON "insights"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "insights_id_agency_id_key" ON "insights"("id", "agency_id");

-- CreateIndex
CREATE INDEX "insight_source_reviews_agency_id_insight_id_idx" ON "insight_source_reviews"("agency_id", "insight_id");

-- CreateIndex
CREATE INDEX "insight_source_reviews_agency_id_review_id_idx" ON "insight_source_reviews"("agency_id", "review_id");

-- CreateIndex
CREATE UNIQUE INDEX "insight_source_reviews_insight_id_review_id_key" ON "insight_source_reviews"("insight_id", "review_id");

-- CreateIndex
CREATE INDEX "competitors_agency_id_restaurant_id_status_idx" ON "competitors"("agency_id", "restaurant_id", "status");

-- CreateIndex
CREATE INDEX "competitors_agency_id_location_id_idx" ON "competitors"("agency_id", "location_id");

-- CreateIndex
CREATE INDEX "competitors_agency_id_deleted_at_idx" ON "competitors"("agency_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "competitors_id_agency_id_key" ON "competitors"("id", "agency_id");

-- CreateIndex
CREATE INDEX "competitor_observations_agency_id_competitor_id_observed_at_idx" ON "competitor_observations"("agency_id", "competitor_id", "observed_at");

-- CreateIndex
CREATE INDEX "competitor_observations_agency_id_signal_type_observed_at_idx" ON "competitor_observations"("agency_id", "signal_type", "observed_at");

-- CreateIndex
CREATE INDEX "competitor_observations_agency_id_deleted_at_idx" ON "competitor_observations"("agency_id", "deleted_at");

-- CreateIndex
CREATE INDEX "reports_agency_id_restaurant_id_created_at_idx" ON "reports"("agency_id", "restaurant_id", "created_at");

-- CreateIndex
CREATE INDEX "reports_agency_id_location_id_idx" ON "reports"("agency_id", "location_id");

-- CreateIndex
CREATE INDEX "reports_agency_id_status_idx" ON "reports"("agency_id", "status");

-- CreateIndex
CREATE INDEX "reports_agency_id_date_range_start_date_range_end_idx" ON "reports"("agency_id", "date_range_start", "date_range_end");

-- CreateIndex
CREATE INDEX "reports_created_by_user_id_idx" ON "reports"("created_by_user_id");

-- CreateIndex
CREATE INDEX "reports_agency_id_deleted_at_idx" ON "reports"("agency_id", "deleted_at");

-- CreateIndex
CREATE INDEX "scheduled_jobs_agency_id_job_type_status_idx" ON "scheduled_jobs"("agency_id", "job_type", "status");

-- CreateIndex
CREATE INDEX "scheduled_jobs_next_run_at_status_idx" ON "scheduled_jobs"("next_run_at", "status");

-- CreateIndex
CREATE INDEX "scheduled_jobs_agency_id_review_source_id_idx" ON "scheduled_jobs"("agency_id", "review_source_id");

-- CreateIndex
CREATE INDEX "scheduled_jobs_agency_id_restaurant_id_idx" ON "scheduled_jobs"("agency_id", "restaurant_id");

-- CreateIndex
CREATE INDEX "scheduled_jobs_agency_id_location_id_idx" ON "scheduled_jobs"("agency_id", "location_id");

-- CreateIndex
CREATE INDEX "scheduled_jobs_agency_id_deleted_at_idx" ON "scheduled_jobs"("agency_id", "deleted_at");

-- CreateIndex
CREATE INDEX "audit_logs_agency_id_created_at_idx" ON "audit_logs"("agency_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_agency_id_entity_type_entity_id_idx" ON "audit_logs"("agency_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_agency_id_action_idx" ON "audit_logs"("agency_id", "action");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sources" ADD CONSTRAINT "review_sources_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sources" ADD CONSTRAINT "review_sources_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_sources" ADD CONSTRAINT "review_sources_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_review_source_id_agency_id_fkey" FOREIGN KEY ("review_source_id", "agency_id") REFERENCES "review_sources"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_source_reviews" ADD CONSTRAINT "insight_source_reviews_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_source_reviews" ADD CONSTRAINT "insight_source_reviews_insight_id_agency_id_fkey" FOREIGN KEY ("insight_id", "agency_id") REFERENCES "insights"("id", "agency_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_source_reviews" ADD CONSTRAINT "insight_source_reviews_review_id_agency_id_fkey" FOREIGN KEY ("review_id", "agency_id") REFERENCES "reviews"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_observations" ADD CONSTRAINT "competitor_observations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_observations" ADD CONSTRAINT "competitor_observations_competitor_id_agency_id_fkey" FOREIGN KEY ("competitor_id", "agency_id") REFERENCES "competitors"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_restaurant_id_agency_id_fkey" FOREIGN KEY ("restaurant_id", "agency_id") REFERENCES "restaurants"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_location_id_agency_id_fkey" FOREIGN KEY ("location_id", "agency_id") REFERENCES "locations"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_review_source_id_agency_id_fkey" FOREIGN KEY ("review_source_id", "agency_id") REFERENCES "review_sources"("id", "agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

