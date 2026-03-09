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

export function Documents() {
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
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center ${documentTypeColors[doc.doc_type].split(' ')[1]}`}>
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-700 text-sm truncate">{doc.file_name}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-[250px] mt-0.5">{doc.file_path}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'doc_type',
      header: 'Tipe Dokumen',
      cell: ({ row }) => (
        <Badge className={`border-none px-2.5 py-1 text-[11px] font-semibold ${documentTypeColors[row.original.doc_type]}`}>
          {documentTypeLabels[row.original.doc_type]}
        </Badge>
      ),
    },
    {
      accessorKey: 'file_path',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg border-slate-200 bg-white text-primary-500 hover:text-primary-600 hover:bg-primary-50 shadow-xs transition-colors font-medium px-3 text-xs h-8"
          onClick={() => {
            if (row.original.file_path) {
              window.open(row.original.file_path, '_blank');
            } else {
              toast.error('File belum tersedia');
            }
          }}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
          Unduh
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
              variant="outline"
              size="icon"
              onClick={() => handleEdit(doc)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(doc)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 h-9 sm:h-10 text-sm shadow-sm font-medium transition-colors w-full sm:w-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tambah Dokumen
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari berdasarkan nama atau tipe dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium transition-all"
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
                    <Input {...field} placeholder="Masukkan nama file" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
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
                      <SelectTrigger className="bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-primary-100 shadow-xs font-medium px-3 h-10">
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
                      <Input {...field} placeholder="https:// ... (URL File)" className="flex-1 bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" // ini adalah type file yang diizinkan
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-10 rounded-lg bg-white border-slate-200 text-primary-500 hover:text-primary-600 shadow-xs hover:bg-primary-50 px-4 font-medium text-sm"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <UploadCloud className="h-4 w-4 mr-1.5" strokeWidth={2} />}
                        {isUploading ? 'Unggah...' : 'Upload'}
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
