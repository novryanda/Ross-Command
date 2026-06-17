-- AlterTable
ALTER TABLE "orders" ADD COLUMN "posting_source_url" TEXT,
ADD COLUMN "posting_target_platforms" JSONB;
