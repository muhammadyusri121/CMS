import { z } from 'zod';
import { PostCategory, DocumentType } from '@/types';

// Education Personnel Schema
export const educationPersonnelSchema = z.object({
  full_name: z.string().min(1, 'Nama lengkap wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  nip: z.string().min(1, 'NIP wajib diisi').max(20, 'NIP maksimal 20 karakter'),
  position: z.string().min(1, 'Jabatan wajib diisi').max(100, 'Jabatan maksimal 100 karakter'),
  image_url: z.string().optional().or(z.literal('')),
  sort_order: z.number().int().min(0, 'Urutan minimal 0'),
});

export type EducationPersonnelFormData = z.infer<typeof educationPersonnelSchema>;

// Post Schema
export const postSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  slug: z.string().min(1, 'Slug wajib diisi').max(200, 'Slug maksimal 200 karakter'),
  content: z.string().min(1, 'Konten wajib diisi'),
  category: z.nativeEnum(PostCategory).refine((val) => Object.values(PostCategory).includes(val), {
    message: 'Kategori wajib dipilih',
  }),
  images: z.array(z.string()),
  is_published: z.boolean(),
});

export type PostFormData = z.infer<typeof postSchema>;

// Graduation Schema
export const graduationSchema = z.object({
  nisn: z.string().min(10, 'NISN minimal 10 digit').max(20, 'NISN maksimal 20 karakter'),
  student_name: z.string().min(1, 'Nama siswa wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  exam_number: z.string().min(1, 'Nomor ujian wajib diisi').max(50, 'Nomor ujian maksimal 50 karakter'),
  is_graduated: z.boolean(),
  graduation_year: z.number().int().min(2000, 'Tahun minimal 2000').max(2100, 'Tahun maksimal 2100'),
});

export type GraduationFormData = z.infer<typeof graduationSchema>;

// Academic Document Schema
export const academicDocumentSchema = z.object({
  file_name: z.string().min(1, 'Nama file wajib diisi').max(200, 'Nama file maksimal 200 karakter'),
  file_path: z.string().min(1, 'Path file wajib diisi').max(500, 'Path file maksimal 500 karakter'),
  doc_type: z.nativeEnum(DocumentType).refine((val) => Object.values(DocumentType).includes(val), {
    message: 'Tipe dokumen wajib dipilih',
  }),
});

export type AcademicDocumentFormData = z.infer<typeof academicDocumentSchema>;

// Extracurricular Schema
export const extracurricularSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  content: z.string().min(1, 'Konten wajib diisi'),
  ekskul_name: z.string().min(1, 'Nama ekstrakurikuler wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  thumbnail: z.string().optional().or(z.literal('')),
  is_published: z.boolean(),
});

export type ExtracurricularFormData = z.infer<typeof extracurricularSchema>;

// Facility Schema
export const facilitySchema = z.object({
  name: z.string().min(1, 'Nama fasilitas wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  quantity: z.number().int().min(0, 'Jumlah minimal 0'),
  image_url: z.string().optional().or(z.literal('')),
});

export type FacilityFormData = z.infer<typeof facilitySchema>;

// Slug generation helper
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
