-- CreateEnum
CREATE TYPE "MetricScrapePhase" AS ENUM ('baseline', 'deadline');

-- CreateEnum
CREATE TYPE "MetricScrapeStatus" AS ENUM ('pending', 'running', 'succeeded', 'failed');

-- AlterTable
ALTER TABLE "order_social_targets" ADD COLUMN "final_metrics" JSONB,
ADD COLUMN "baseline_scraped_at" TIMESTAMP(3),
ADD COLUMN "final_scraped_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" VARCHAR(50) NOT NULL DEFAULT 'default',
    "apify_api_token_enc" TEXT,
    "apify_webhook_secret_enc" TEXT,
    "apify_actors" JSONB,
    "updated_by_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_scrape_runs" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_social_target_id" UUID NOT NULL,
    "phase" "MetricScrapePhase" NOT NULL,
    "status" "MetricScrapeStatus" NOT NULL DEFAULT 'pending',
    "apify_run_id" VARCHAR(100),
    "apify_actor_id" VARCHAR(200),
    "metrics" JSONB,
    "raw_payload" JSONB,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "metric_scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metric_scrape_runs_order_id_idx" ON "metric_scrape_runs"("order_id");

-- CreateIndex
CREATE INDEX "metric_scrape_runs_status_idx" ON "metric_scrape_runs"("status");

-- CreateIndex
CREATE INDEX "metric_scrape_runs_apify_run_id_idx" ON "metric_scrape_runs"("apify_run_id");

-- CreateIndex
CREATE UNIQUE INDEX "metric_scrape_runs_order_social_target_id_phase_key" ON "metric_scrape_runs"("order_social_target_id", "phase");

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_scrape_runs" ADD CONSTRAINT "metric_scrape_runs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_scrape_runs" ADD CONSTRAINT "metric_scrape_runs_order_social_target_id_fkey" FOREIGN KEY ("order_social_target_id") REFERENCES "order_social_targets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
