-- CreateTable
CREATE TABLE "order_social_targets" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_social_targets_pkey" PRIMARY KEY ("id")
);

-- Migrate existing target_url data
INSERT INTO "order_social_targets" ("id", "order_id", "platform", "url", "sort_order", "created_at")
SELECT
    gen_random_uuid(),
    "id",
    CASE
        WHEN "target_url" ILIKE '%instagram.com%' THEN 'instagram'::"SocialPlatform"
        WHEN "target_url" ILIKE '%facebook.com%' THEN 'facebook'::"SocialPlatform"
        WHEN "target_url" ILIKE '%twitter.com%' OR "target_url" ILIKE '%x.com%' THEN 'twitter_x'::"SocialPlatform"
        WHEN "target_url" ILIKE '%tiktok.com%' THEN 'tiktok'::"SocialPlatform"
        WHEN "target_url" ILIKE '%youtube.com%' OR "target_url" ILIKE '%youtu.be%' THEN 'youtube'::"SocialPlatform"
        ELSE 'other'::"SocialPlatform"
    END,
    "target_url",
    0,
    CURRENT_TIMESTAMP
FROM "orders"
WHERE "target_url" IS NOT NULL AND "target_url" <> '';

-- DropColumn
ALTER TABLE "orders" DROP COLUMN "target_url";

-- CreateIndex
CREATE INDEX "order_social_targets_order_id_idx" ON "order_social_targets"("order_id");

-- AddForeignKey
ALTER TABLE "order_social_targets" ADD CONSTRAINT "order_social_targets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
