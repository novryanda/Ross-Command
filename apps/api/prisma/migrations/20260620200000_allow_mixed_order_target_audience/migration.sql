DROP INDEX IF EXISTS "order_targets_order_id_unit_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "order_targets_order_id_unit_id_target_audience_key"
ON "order_targets"("order_id", "unit_id", "target_audience");
