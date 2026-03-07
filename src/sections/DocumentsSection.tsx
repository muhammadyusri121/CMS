import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, FileText, Download, Calendar, BookOpen, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui-custom/DataTable';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentType } from '@/types';
import type { AcademicDocument } from '@/types';
import { academicDocumentSchema } from '@/schemas';
import type { AcademicDocumentFormData } from '@/schemas';
import {
  getAcademicDocuments,
  createAcademicDocument,
  updateAcademicDocument,
  deleteAcademicDocument,
} from '@/actions';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

const documentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.REGULATION]: 'Peraturan',
  [DocumentType.SCHEDULE]: 'Jadwal',
  [DocumentType.TEACHING_MATERIAL]: 'Materi Ajar',
};

const documentTypeIcons: Record<DocumentType, React.ElementType> = {
  [DocumentType.REGULATION]: FileText,
  [DocumentType.SCHEDULE]: Calendar,
  [DocumentType.TEACHING_MATERIAL]: BookOpen,
};

const documentTypeColors: Record<DocumentType, string> = {
  [DocumentType.REGULATION]: 'bg-red-100 text-red-700',
  [DocumentType.SCHEDULE]: 'bg-blue-100 text-blue-700',
  [DocumentType.TEACHING_MATERIAL]: 'bg-purple-100 text-purple-700',
};

export function DocumentsSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<AcademicDocument | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AcademicDocumentFormData>({
    resolver: zodResolver(academicDocumentSchema),
    defaultValues: {
      file_name: '',
      file_path: '',
      doc_type: DocumentType.REGULATION,
    },
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getAcademicDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        toast.error(response.error || 'Gagal memuat data dokumen');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDocument(null);
    form.reset({
      file_name: '',
      file_path: '',
      doc_type: DocumentType.REGULATION,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (doc: AcademicDocument) => {
    setSelectedDocument(doc);
    form.reset({
      file_name: doc.file_name,
      file_path: doc.file_path,
      doc_type: doc.doc_type,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (doc: AcademicDocument) => {
    setSelectedDocument(doc);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: AcademicDocumentFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedDocument) {
        const response = await updateAcademicDocument(selectedDocument.id, data);
        if (response.success) {
          toast.success(response.message || 'Dokumen berhasil diperbarui');
          setIsFormOpen(false);
          loadDocuments();
        } else {
          toast.error(response.error || 'Gagal memperbarui dokumen');
        }
      } else {
        const response = await createAcademicDocument({
          ...data,
        });
        if (response.success) {
          toast.success(response.message || 'Dokumen berhasil ditambahkan');
          setIsFormOpen(false);
          loadDocuments();
        } else {
          toast.error(response.error || 'Gagal menambahkan dokumen');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedDocument) return;

    try {
      setIsSubmitting(true);
      const response = await deleteAcademicDocument(selectedDocument.id);
      if (response.success) {
        toast.success(response.message || 'Dokumen berhasil dihapus');
        setIsDeleteOpen(false);
        loadDocuments();
      } else {
        toast.error(response.error || 'Gagal menghapus dokumen');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'documents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success && result.data?.url) {
        form.setValue('file_path', result.data.url);
        toast.success('File berhasil diunggah');
      } else {
        toast.error(result.error || 'Gagal mengunggah file');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah');
    } finally {
      setIsUploading(false);
      // Reset input agar bisa upload kembar file baru yang sama jika error
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredDocuments = documents.filter(
    (d) =>
      d.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documentTypeLabels[d.doc_type].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<AcademicDocument>[] = [
    {
      accessorKey: 'file_name',
      header: 'Nama File',
      cell: ({ row }) => {
        const doc = row.original;
        const Icon = documentTypeIcons[doc.doc_type];
        return (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 shrink-0 rounded-[12px] bg-[#1e293b] flex items-center justify-center shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] ${documentTypeColors[doc.doc_type].split(' ')[1]}`}>
              <Icon className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-slate-200">{doc.file_name}</p>
              <p className="text-xs font-semibold text-slate-400 line-clamp-1">{doc.file_path}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'doc_type',
      header: 'Tipe Dokumen',
      cell: ({ row }) => (
        <Badge className={`border-none shadow-[2px_2px_5px_#0f172a,-2px_-2px_5px_#334155] hover:bg-[#1e293b] px-3 py-1 font-bold ${documentTypeColors[row.original.doc_type].split(' ')[1]} bg-[#1e293b] text-sm`}>
          {documentTypeLabels[row.original.doc_type]}
        </Badge>
      ),
    },
    {
      accessorKey: 'file_path',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all font-bold px-4"
          onClick={() => {
            if (row.original.file_path) {
              window.open(row.original.file_path, '_blank');
            } else {
              toast.error('File belum tersedia');
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" strokeWidth={2.5} />
          Lihat / Unduh
        </Button>
      ),
    },
    {
      id: 'actions',
      header: 'Kelola',
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(doc)}
              className="h-10 w-10 rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc)}
              className="h-10 w-10 rounded-full bg-[#1e293b] text-red-500 hover:text-red-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-500 tracking-tight">Dokumen Akademik</h2>
          <p className="text-slate-500 font-medium">Kelola dokumen, regulasi, dan jadwal akademik</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full px-6 h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Dokumen
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
          <Input
            placeholder="Cari berdasarkan nama atau tipe dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 h-12 bg-[#1e293b] border-none rounded-full text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_6px_6px_10px_#0f172a,inset_-6px_-6px_10px_#334155] font-medium transition-shadow"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredDocuments}
        pageCount={1}
        pageIndex={0}
        pageSize={filteredDocuments.length}
        totalItems={filteredDocuments.length}
        onPageChange={() => { }}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedDocument ? 'Edit Dokumen' : 'Tambah Dokumen'}
        description={selectedDocument ? 'Perbarui data dokumen' : 'Tambahkan dokumen baru'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="file_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama File</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama file" className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doc_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Dokumen</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus:ring-0 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12">
                        <SelectValue placeholder="Pilih tipe dokumen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(documentTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file_path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File / Dokumen</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input {...field} placeholder="https:// ... (URL File)" className="flex-1 bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" // ini adalah type file yang diizinkan
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 rounded-2xl border-none bg-[#1e293b] text-cyan-500 hover:text-cyan-600 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] px-6 font-bold"
                      >
                        {isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" strokeWidth={2.5} />}
                        {isUploading ? 'Unggah...' : 'Upload File'}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-slate-500 mt-1">
                    Anda bisa mengunggah file PDF/Word langsung, atau isikan URL file secara manual.
                  </p>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </FormDialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={selectedDocument?.file_name}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
