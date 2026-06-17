-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "drive_link" DROP NOT NULL;
ALTER TABLE "submissions" ADD COLUMN "platform_links" JSONB;
