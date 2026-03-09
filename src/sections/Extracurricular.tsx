import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, Trophy, ImageIcon, Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui-custom/DataTable';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';
import { RichTextEditor } from '@/components/ui-custom/RichTextEditor';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import type { Extracurricular } from '@/types';
import { extracurricularSchema, EKSKUL_OPTIONS } from '@/schemas';
import type { ExtracurricularFormData } from '@/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getExtracurriculars,
  createExtracurricular,
  updateExtracurricular,
  deleteExtracurricular,
} from '@/actions';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function Extracurricular() {
  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedExtracurricular, setSelectedExtracurricular] = useState<Extracurricular | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      formData.append('folder', 'extracurriculars');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.data?.url) {
        form.setValue('thumbnail', result.data.url);
        toast.success('Thumbnail berhasil diunggah');
      } else {
        toast.error(result.error || 'Gagal mengunggah thumbnail');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi saat mengunggah');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const form = useForm<ExtracurricularFormData>({
    resolver: zodResolver(extracurricularSchema),
    defaultValues: {
      title: '',
      content: '',
      ekskul_name: EKSKUL_OPTIONS[0],
      thumbnail: '',
      is_published: false,
    },
  });

  useEffect(() => {
    loadExtracurriculars();
  }, [pageIndex, pageSize, sorting]);

  const loadExtracurriculars = async () => {
    try {
      setIsLoading(true);
      const response = await getExtracurriculars({
        page: pageIndex + 1,
        limit: pageSize,
        sortBy: sorting[0]?.id || 'created_at',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      });
      if (response.success && response.data) {
        setExtracurriculars(response.data.data);
        setTotalItems(response.data.total);
        setPageCount(response.data.totalPages);
      } else {
        toast.error(response.error || 'Gagal memuat data ekstrakurikuler');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedExtracurricular(null);
    form.reset({
      title: '',
      content: '',
      ekskul_name: EKSKUL_OPTIONS[0],
      thumbnail: '',
      is_published: false,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (extra: Extracurricular) => {
    setSelectedExtracurricular(extra);
    form.reset({
      title: extra.title,
      content: extra.content,
      ekskul_name: EKSKUL_OPTIONS.includes(extra.ekskul_name as any)
        ? (extra.ekskul_name as typeof EKSKUL_OPTIONS[number])
        : EKSKUL_OPTIONS[0],
      thumbnail: extra.thumbnail || '',
      is_published: extra.is_published,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (extra: Extracurricular) => {
    setSelectedExtracurricular(extra);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: ExtracurricularFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedExtracurricular) {
        const response = await updateExtracurricular(selectedExtracurricular.id, data);
        if (response.success) {
          toast.success(response.message || 'Ekstrakurikuler berhasil diperbarui');
          setIsFormOpen(false);
          loadExtracurriculars();
        } else {
          toast.error(response.error || 'Gagal memperbarui ekstrakurikuler');
        }
      } else {
        const response = await createExtracurricular({
          ...data,
          thumbnail: data.thumbnail || null,
        });
        if (response.success) {
          toast.success(response.message || 'Ekstrakurikuler berhasil ditambahkan');
          setIsFormOpen(false);
          loadExtracurriculars();
        } else {
          toast.error(response.error || 'Gagal menambahkan ekstrakurikuler');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedExtracurricular) return;

    try {
      setIsSubmitting(true);
      const response = await deleteExtracurricular(selectedExtracurricular.id);
      if (response.success) {
        toast.success(response.message || 'Ekstrakurikuler berhasil dihapus');
        setIsDeleteOpen(false);
        loadExtracurriculars();
      } else {
        toast.error(response.error || 'Gagal menghapus ekstrakurikuler');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExtracurriculars = extracurriculars.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.ekskul_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Extracurricular>[] = [
    {
      accessorKey: 'title',
      header: 'Judul Artikel',
      cell: ({ row }) => {
        const extra = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
              {extra.thumbnail ? (
                <img src={extra.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-5 w-5 text-slate-300" />
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-slate-700 line-clamp-1 text-[15px] hover:text-blue-600 transition-colors cursor-pointer">{extra.title}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">/{extra.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'ekskul_name',
      header: 'Nama Ekskul',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-orange-500" strokeWidth={2} />
          <span className="font-semibold text-slate-700 text-sm">{row.original.ekskul_name.replace(/_/g, ' ')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold">
          {row.original.is_published ? (
            <>
              <Eye className="h-4 w-4 text-emerald-500" strokeWidth={2} />
              <span className="text-sm text-emerald-600">Dipublikasikan</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-slate-300" strokeWidth={2} />
              <span className="text-sm text-slate-400">Draft</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-[13px] font-medium text-slate-500">
          {format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: id })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const extra = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(extra)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs transition-colors"
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(extra)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs transition-colors"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
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
          Tambah Artikel Ekskul
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2} />
          <Input
            placeholder="Cari judul artikel atau nama ekskul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredExtracurriculars}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPageIndex}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedExtracurricular ? 'Edit Artikel Ekskul' : 'Tambah Artikel Ekskul'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Artikel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan judul artikel" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ekskul_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ekstrakurikuler</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 font-medium px-3 h-10">
                          <SelectValue placeholder="Pilih Ekstrakurikuler..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-lg border-slate-200 shadow-dropdown bg-white">
                        {EKSKUL_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt} className="font-semibold text-slate-700 hover:text-blue-600 focus:bg-blue-50 cursor-pointer py-3 rounded-xl">
                            {opt.replace(/_/g, ' ')}
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
                name="is_published"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Publikasi</FormLabel>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-4 h-10 shadow-xs">
                      <span className="text-sm font-medium text-slate-600">Tampilkan ke publik</span>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary-500 data-[state=unchecked]:bg-slate-200"
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Thumbnail</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 relative items-center">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
                        <Input {...field} placeholder="https://example.com/image.jpg" className="w-full pl-9 h-10 bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 w-12 rounded-lg bg-white border-slate-200 text-primary-500 hover:text-primary-600 shadow-xs hover:bg-primary-50"
                      >
                        {isUploading ? '...' : <Upload className="h-5 w-5" strokeWidth={2} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konten Artikel</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tulis konten artikel kegiatan ekstrakurikuler..."
                      error={!!form.formState.errors.content}
                    />
                  </FormControl>
                  <FormMessage />
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
        itemName={selectedExtracurricular?.title}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
