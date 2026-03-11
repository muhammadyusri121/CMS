import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, ImageIcon, Upload, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PostCategory } from '@/types';
import type { Post } from '@/types';
import { postSchema, generateSlug } from '@/schemas';
import type { PostFormData } from '@/schemas';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} from '@/actions';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const categoryLabels: Record<PostCategory, string> = {
  [PostCategory.SUPERVISI_GURU]: 'Supervisi Guru',
  [PostCategory.ASAS]: 'ASAS',
  [PostCategory.ASAJ]: 'ASAJ',
  [PostCategory.TKA]: 'TKA',
  [PostCategory.KARYA_SISWA]: 'Karya Siswa',
  [PostCategory.HUMAS]: 'Humas',
  [PostCategory.KOMITE]: 'Komite',
  [PostCategory.KEMITRAAN]: 'Kemitraan',
  [PostCategory.DOUBLE_TRACK]: 'Double Track',
  [PostCategory.OSIS_MPK]: 'OSIS MPK',
};

const categoryColors: Record<PostCategory, string> = {
  [PostCategory.SUPERVISI_GURU]: 'bg-blue-100 text-blue-700',
  [PostCategory.ASAS]: 'bg-purple-100 text-purple-700',
  [PostCategory.ASAJ]: 'bg-purple-100 text-purple-700',
  [PostCategory.TKA]: 'bg-yellow-100 text-yellow-700',
  [PostCategory.KARYA_SISWA]: 'bg-emerald-100 text-emerald-700',
  [PostCategory.HUMAS]: 'bg-pink-100 text-pink-700',
  [PostCategory.KOMITE]: 'bg-orange-100 text-orange-700',
  [PostCategory.KEMITRAAN]: 'bg-teal-100 text-teal-700',
  [PostCategory.DOUBLE_TRACK]: 'bg-indigo-100 text-indigo-700',
  [PostCategory.OSIS_MPK]: 'bg-red-100 text-red-700',
};

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setIsUploading(true);
      const newUrls = [...(form.getValues('images') || [])];

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ukuran file ${file.name} maksimal 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'posts');

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: formData,
        });

        const result = await response.json();
        if (result.success && result.data?.url) {
          newUrls.push(result.data.url);
          toast.success('Gambar berhasil diunggah');
        } else {
          toast.error(result.error || 'Gagal mengunggah gambar');
        }
      }

      form.setValue('images', newUrls);
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi saat mengunggah');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredCategories = Object.entries(categoryLabels).filter(([value]) => {
    if (useAuthStore.getState().user?.role === 'ADMIN') return true;
    return useAuthStore.getState().user?.permissions?.includes(`cat:${value}`);
  });

  const defaultCategory = filteredCategories.length > 0 
    ? (filteredCategories[0][0] as PostCategory) 
    : PostCategory.HUMAS;

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      category: defaultCategory,
      images: [],
      is_published: false,
    },
  });

  // Watch title for auto-generating slug
  const watchTitle = form.watch('title');

  useEffect(() => {
    if (watchTitle && !selectedPost) {
      form.setValue('slug', generateSlug(watchTitle));
    }
  }, [watchTitle, selectedPost, form]);

  useEffect(() => {
    loadPosts();
  }, [pageIndex, pageSize, sorting]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await getPosts({
        page: pageIndex + 1,
        limit: pageSize,
        sortBy: sorting[0]?.id || 'created_at',
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      });
      if (response.success && response.data) {
        setPosts(response.data.data);
        setTotalItems(response.data.total);
        setPageCount(response.data.totalPages);
      } else {
        toast.error(response.error || 'Gagal memuat data postingan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPost(null);
    form.reset({
      title: '',
      slug: '',
      content: '',
      category: defaultCategory,
      images: [],
      is_published: false,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      content: post.content,
      category: post.category,
      images: post.images || [],
      is_published: post.is_published,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedPost) {
        const response = await updatePost(selectedPost.id, data);
        if (response.success) {
          toast.success(response.message || 'Postingan berhasil diperbarui');
          setIsFormOpen(false);
          loadPosts();
        } else {
          toast.error(response.error || 'Gagal memperbarui postingan');
        }
      } else {
        const response = await createPost({
          ...data,
          images: data.images || [],
        });
        if (response.success) {
          toast.success(response.message || 'Postingan berhasil ditambahkan');
          setIsFormOpen(false);
          loadPosts();
        } else {
          toast.error(response.error || 'Gagal menambahkan postingan');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedPost) return;

    try {
      setIsSubmitting(true);
      const response = await deletePost(selectedPost.id);
      if (response.success) {
        toast.success(response.message || 'Postingan berhasil dihapus');
        setIsDeleteOpen(false);
        loadPosts();
      } else {
        toast.error(response.error || 'Gagal menghapus postingan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'title',
      header: 'Judul',
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
              {post.images && post.images.length > 0 ? (
                <img src={post.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-4 w-4 text-slate-300" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-slate-700 line-clamp-1 text-sm">{post.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">/{post.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
        <Badge className={`border-none px-2.5 py-1 text-[11px] font-semibold ${categoryColors[row.original.category]}`}>
          {categoryLabels[row.original.category]}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.is_published ? (
            <>
              <Eye className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
              <span className="text-xs font-medium text-emerald-600">Publik</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5 text-slate-300" strokeWidth={2} />
              <span className="text-xs font-medium text-slate-400">Draft</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-500">
          {format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: id })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(post)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(post)}
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
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Tambah Postingan
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari judul postingan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPosts}
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
        title={selectedPost ? 'Edit Postingan' : 'Tambah Postingan'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        className="sm:max-w-3xl lg:max-w-4xl"
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan judul postingan" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || defaultCategory}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-primary-100 shadow-xs font-medium px-3 h-10">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent 
                        position="popper" 
                        sideOffset={5}
                        className="rounded-lg border-slate-200 shadow-xl min-w-[var(--radix-select-trigger-width)] z-[100]"
                      >
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(([value, label]) => (
                            <SelectItem key={value} value={value} className="py-2.5 cursor-pointer hover:bg-slate-50">
                              {label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-6 px-3 text-center">
                            <p className="text-xs text-slate-400 italic">Izin kategori tidak ditemukan</p>
                          </div>
                        )}
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kumpulan Gambar (Bisa lebih dari 1)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {field.value.map((url, idx) => (
                            <div key={idx} className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group border border-slate-200 shadow-sm">
                              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newVals = [...field.value];
                                  newVals.splice(idx, 1);
                                  field.onChange(newVals);
                                }}
                                className="absolute inset-0 bg-red-500/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex cursor-pointer text-white"
                              >
                                <Trash2 className="h-6 w-6 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Tempel URL gambar baru (Enter)"
                            className="w-full pl-9 h-10 bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium text-sm"
                            id="manual-url-input"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const inputNode = e.currentTarget;
                                const val = inputNode.value.trim();
                                if (val) {
                                  field.onChange([...(field.value || []), val]);
                                  inputNode.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="h-10 px-4 rounded-lg bg-white border-slate-200 text-primary-500 hover:text-primary-600 shadow-xs hover:bg-primary-50 font-medium shrink-0"
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <><Upload className="h-4 w-4 mr-2" strokeWidth={2} /> Upload PC</>
                          )}
                        </Button>
                      </div>
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
                  <FormLabel>Konten</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tulis konten postingan..."
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
        itemName={selectedPost?.title}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
