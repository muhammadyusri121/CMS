// Database Models Types

export const PostCategory = {
  NEWS: 'NEWS',
  STUDENT_WORK: 'STUDENT_WORK',
  DOUBLE_TRACK: 'DOUBLE_TRACK',
  HUMAS: 'HUMAS',
  OSIS: 'OSIS',
} as const;

export type PostCategory = typeof PostCategory[keyof typeof PostCategory];

export const DocumentType = {
  REGULATION: 'REGULATION',
  SCHEDULE: 'SCHEDULE',
  TEACHING_MATERIAL: 'TEACHING_MATERIAL',
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface EducationPersonnel {
  id: string;
  full_name: string;
  nip: string;
  position: string;
  image_url: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: PostCategory;
  images: string[];
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Graduation {
  nisn: string;
  student_name: string;
  exam_number: string;
  is_graduated: boolean;
  graduation_year: number;
  created_at: Date;
  updated_at: Date;
}

export interface AcademicDocument {
  id: string;
  file_name: string;
  file_path: string;
  doc_type: DocumentType;
  created_at: Date;
  updated_at: Date;
}

export interface Extracurricular {
  id: string;
  title: string;
  slug: string;
  content: string;
  ekskul_name: string;
  thumbnail: string | null;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Facility {
  id: string;
  name: string;
  quantity: number;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

// Dashboard Statistics
export interface DashboardStats {
  totalPersonnel: number;
  totalPosts: number;
  totalGraduates: number;
  totalDocuments: number;
  totalExtracurriculars: number;
  totalFacilities: number;
  publishedPosts: number;
  graduatedStudents: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
