/*
  Warnings:

  - The values [INNOVATION] on the enum `PostCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostCategory_new" AS ENUM ('NEWS', 'STUDENT_WORK', 'DOUBLE_TRACK', 'HUMAS', 'OSIS');
ALTER TABLE "Post" ALTER COLUMN "category" TYPE "PostCategory_new" USING ("category"::text::"PostCategory_new");
ALTER TYPE "PostCategory" RENAME TO "PostCategory_old";
ALTER TYPE "PostCategory_new" RENAME TO "PostCategory";
DROP TYPE "PostCategory_old";
COMMIT;
