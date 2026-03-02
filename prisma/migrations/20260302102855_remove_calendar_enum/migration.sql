/*
  Warnings:

  - The values [CALENDAR] on the enum `DocType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocType_new" AS ENUM ('REGULATION', 'SCHEDULE', 'TEACHING_MATERIAL');
ALTER TABLE "AcademicDocument" ALTER COLUMN "doc_type" TYPE "DocType_new" USING ("doc_type"::text::"DocType_new");
ALTER TYPE "DocType" RENAME TO "DocType_old";
ALTER TYPE "DocType_new" RENAME TO "DocType";
DROP TYPE "DocType_old";
COMMIT;
