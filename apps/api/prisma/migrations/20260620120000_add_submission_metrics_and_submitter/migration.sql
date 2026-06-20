ALTER TABLE "submissions"
  ADD COLUMN "submitted_by_user_id" UUID,
  ADD COLUMN "submission_source" VARCHAR(30) NOT NULL DEFAULT 'self',
  ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "comments" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shares" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reposts" INTEGER NOT NULL DEFAULT 0;

UPDATE "submissions"
SET "submitted_by_user_id" = "user_id"
WHERE "submitted_by_user_id" IS NULL;

ALTER TABLE "submissions"
  ALTER COLUMN "submitted_by_user_id" SET NOT NULL;

ALTER TABLE "submissions"
  ADD CONSTRAINT "submissions_submitted_by_user_id_fkey"
  FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "submissions_submitted_by_user_id_idx" ON "submissions"("submitted_by_user_id");
