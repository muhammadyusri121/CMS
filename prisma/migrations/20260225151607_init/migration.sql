-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('INNOVATION', 'NEWS', 'STUDENT_WORK', 'DOUBLE_TRACK', 'HUMAS', 'OSIS');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('REGULATION', 'SCHEDULE', 'CALENDAR', 'TEACHING_MATERIAL');

-- CreateTable
CREATE TABLE "EducationPersonnel" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "nip" TEXT,
    "position" TEXT NOT NULL,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationPersonnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "PostCategory" NOT NULL,
    "thumbnail" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graduation" (
    "id" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "exam_number" TEXT,
    "is_graduated" BOOLEAN NOT NULL DEFAULT false,
    "graduation_year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Graduation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicDocument" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extracurricular" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coach" TEXT,
    "image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Extracurricular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "image_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EducationPersonnel_nip_key" ON "EducationPersonnel"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Graduation_nisn_key" ON "Graduation"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "Graduation_exam_number_key" ON "Graduation"("exam_number");
