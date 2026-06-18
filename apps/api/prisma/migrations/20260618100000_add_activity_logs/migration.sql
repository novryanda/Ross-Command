-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('order_created', 'order_sent', 'submission_sent');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "activity_key" VARCHAR(200) NOT NULL,
    "type" "ActivityLogType" NOT NULL,
    "actor_user_id" UUID,
    "order_id" UUID,
    "assignment_id" UUID,
    "submission_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_logs_activity_key_key" ON "activity_logs"("activity_key");

-- CreateIndex
CREATE INDEX "activity_logs_actor_user_id_idx" ON "activity_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "activity_logs_order_id_idx" ON "activity_logs"("order_id");

-- CreateIndex
CREATE INDEX "activity_logs_assignment_id_idx" ON "activity_logs"("assignment_id");

-- CreateIndex
CREATE INDEX "activity_logs_submission_id_idx" ON "activity_logs"("submission_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "task_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill created orders
INSERT INTO "activity_logs" (
    "id",
    "activity_key",
    "type",
    "actor_user_id",
    "order_id",
    "created_at"
)
SELECT
    (
      substr(md5('order_created:' || o.id), 1, 8) || '-' ||
      substr(md5('order_created:' || o.id), 9, 4) || '-' ||
      substr(md5('order_created:' || o.id), 13, 4) || '-' ||
      substr(md5('order_created:' || o.id), 17, 4) || '-' ||
      substr(md5('order_created:' || o.id), 21, 12)
    )::uuid,
    'order_created:' || o.id,
    'order_created'::"ActivityLogType",
    o."created_by",
    o."id",
    o."created_at"
FROM "orders" o
WHERE o."deleted_at" IS NULL
ON CONFLICT ("activity_key") DO NOTHING;

-- Backfill sent orders
INSERT INTO "activity_logs" (
    "id",
    "activity_key",
    "type",
    "actor_user_id",
    "order_id",
    "created_at"
)
SELECT
    (
      substr(md5('order_sent:' || o.id), 1, 8) || '-' ||
      substr(md5('order_sent:' || o.id), 9, 4) || '-' ||
      substr(md5('order_sent:' || o.id), 13, 4) || '-' ||
      substr(md5('order_sent:' || o.id), 17, 4) || '-' ||
      substr(md5('order_sent:' || o.id), 21, 12)
    )::uuid,
    'order_sent:' || o.id,
    'order_sent'::"ActivityLogType",
    o."created_by",
    o."id",
    o."sent_at"
FROM "orders" o
WHERE o."deleted_at" IS NULL
  AND o."sent_at" IS NOT NULL
ON CONFLICT ("activity_key") DO NOTHING;

-- Backfill submissions
INSERT INTO "activity_logs" (
    "id",
    "activity_key",
    "type",
    "actor_user_id",
    "order_id",
    "assignment_id",
    "submission_id",
    "created_at"
)
SELECT
    (
      substr(md5('submission_sent:' || s.id), 1, 8) || '-' ||
      substr(md5('submission_sent:' || s.id), 9, 4) || '-' ||
      substr(md5('submission_sent:' || s.id), 13, 4) || '-' ||
      substr(md5('submission_sent:' || s.id), 17, 4) || '-' ||
      substr(md5('submission_sent:' || s.id), 21, 12)
    )::uuid,
    'submission_sent:' || s.id,
    'submission_sent'::"ActivityLogType",
    s."user_id",
    ta."order_id",
    s."assignment_id",
    s."id",
    s."submitted_at"
FROM "submissions" s
JOIN "task_assignments" ta ON ta."id" = s."assignment_id"
ON CONFLICT ("activity_key") DO NOTHING;
