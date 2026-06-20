CREATE TYPE "OrderTargetAudience" AS ENUM ('all_members', 'unit_leaders', 'direct_user');

ALTER TABLE "order_targets"
  ADD COLUMN "target_audience" "OrderTargetAudience" NOT NULL DEFAULT 'all_members';

UPDATE "order_targets"
SET "target_audience" = 'direct_user'
WHERE "target_type" = 'individual';
