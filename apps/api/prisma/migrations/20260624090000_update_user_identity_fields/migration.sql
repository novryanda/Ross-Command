-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('pria', 'wanita');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('tni', 'pns', 'p3k');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('islam', 'kristen_protestan', 'katolik', 'hindu', 'buddha', 'konghucu');

-- Rename existing identity column so previous NIP data is retained.
ALTER TABLE "users" RENAME COLUMN "nip" TO "identity_number";

-- Rename existing unique index generated for the old column.
ALTER INDEX "users_nip_key" RENAME TO "users_identity_number_key";

-- AddColumns
ALTER TABLE "users"
ADD COLUMN "gender" "Gender",
ADD COLUMN "employment_type" "EmploymentType",
ADD COLUMN "rank" VARCHAR(50),
ADD COLUMN "grade" VARCHAR(50),
ADD COLUMN "religion" "Religion",
ADD COLUMN "phone_number" VARCHAR(30);
