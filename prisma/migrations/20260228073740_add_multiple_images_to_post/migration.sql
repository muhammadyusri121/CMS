/*
  Warnings:

  - You are about to drop the column `coach` on the `Extracurricular` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `Extracurricular` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Extracurricular` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `Post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Extracurricular` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `Extracurricular` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ekskul_name` to the `Extracurricular` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Extracurricular` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Extracurricular` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Extracurricular` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Extracurricular" DROP COLUMN "coach",
DROP COLUMN "image_url",
DROP COLUMN "name",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "ekskul_name" TEXT NOT NULL,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "thumbnail",
ADD COLUMN     "images" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Extracurricular_slug_key" ON "Extracurricular"("slug");
