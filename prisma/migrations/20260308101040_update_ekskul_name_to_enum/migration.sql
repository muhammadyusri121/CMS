/*
  Warnings:

  - The values [NEWS,STUDENT_WORK,OSIS] on the enum `PostCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `exam_number` on the `Graduation` table. All the data in the column will be lost.
  - Changed the type of `ekskul_name` on the `Extracurricular` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EkskulName" AS ENUM ('Pramuka', 'Paskibraka', 'Sains_Club', 'Basket', 'Voli', 'Seni_Tari', 'Paduan_Suara', 'PMR', 'Jurnalistik');

-- AlterEnum
BEGIN;
CREATE TYPE "PostCategory_new" AS ENUM ('SUPERVISI_GURU', 'ASAS', 'ASAJ', 'TKA', 'KARYA_SISWA', 'HUMAS', 'KOMITE', 'KEMITRAAN', 'DOUBLE_TRACK', 'OSIS_MPK');
ALTER TABLE "Post" ALTER COLUMN "category" TYPE "PostCategory_new" USING ("category"::text::"PostCategory_new");
ALTER TYPE "PostCategory" RENAME TO "PostCategory_old";
ALTER TYPE "PostCategory_new" RENAME TO "PostCategory";
DROP TYPE "PostCategory_old";
COMMIT;

-- DropIndex
DROP INDEX "Graduation_exam_number_key";

-- AlterTable
ALTER TABLE "EducationPersonnel" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Extracurricular" DROP COLUMN "ekskul_name",
ADD COLUMN     "ekskul_name" "EkskulName" NOT NULL;

-- AlterTable
ALTER TABLE "Graduation" DROP COLUMN "exam_number",
ADD COLUMN     "birthday" TEXT,
ADD COLUMN     "class_name" TEXT,
ADD COLUMN     "gender" TEXT;

-- CreateTable
CREATE TABLE "SchoolSchedule" (
    "id" TEXT NOT NULL,
    "class_name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "teacher_nip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SchoolSchedule" ADD CONSTRAINT "SchoolSchedule_teacher_nip_fkey" FOREIGN KEY ("teacher_nip") REFERENCES "EducationPersonnel"("nip") ON DELETE SET NULL ON UPDATE CASCADE;
