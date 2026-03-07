import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, ImageIcon, Upload } from 'lucide-react';
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
  [PostCategory.NEWS]: 'Berita',
  [PostCategory.STUDENT_WORK]: 'Karya Siswa',
  [PostCategory.DOUBLE_TRACK]: 'Double Track',
  [PostCategory.HUMAS]: 'HUMAS',
  [PostCategory.OSIS]: 'OSIS',
};

const categoryColors: Record<PostCategory, string> = {
  [PostCategory.NEWS]: 'bg-blue-100 text-blue-700',
  [PostCategory.STUDENT_WORK]: 'bg-emerald-100 text-emerald-700',
  [PostCategory.DOUBLE_TRACK]: 'bg-blue-100 text-blue-700',
  [PostCategory.HUMAS]: 'bg-pink-100 text-pink-700',
  [PostCategory.OSIS]: 'bg-indigo-100 text-indigo-700',
};

export function PostsSection() {
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

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      category: PostCategory.NEWS,
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
      category: PostCategory.NEWS,
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
            <div className="h-10 w-10 shrink-0 rounded-[12px] bg-[#1e293b] shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] flex items-center justify-center overflow-hidden">
              {post.images && post.images.length > 0 ? (
                <img src={post.images[0]} alt="" className="h-full w-full object-cover rounded-[10px]" />
              ) : (
                <ImageIcon className="h-5 w-5 text-cyan-500" />
              )}
            </div>
            <div>
              <p className="font-bold text-slate-200 line-clamp-1">{post.title}</p>
              <p className="text-xs font-semibold text-slate-400">/{post.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => (
        <Badge className={`border-none shadow-[2px_2px_5px_#0f172a,-2px_-2px_5px_#334155] hover:bg-[#1e293b] px-3 py-1 font-bold ${categoryColors[row.original.category]}`}>
          {categoryLabels[row.original.category]}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold">
          {row.original.is_published ? (
            <>
              <Eye className="h-4 w-4 text-cyan-500" strokeWidth={2.5} />
              <span className="text-sm text-cyan-600">Dipublikasikan</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
              <span className="text-sm text-slate-500">Draft</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Dibuat',
      cell: ({ row }) => (
        <span className="text-sm font-bold text-slate-400">
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
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(post)}
              className="h-10 w-10 rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(post)}
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
          <h2 className="text-2xl font-bold text-cyan-500 tracking-tight">Postingan</h2>
          <p className="text-slate-500 font-medium">Kelola berita, inovasi, dan karya siswa</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full px-6 h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Postingan
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
          <Input
            placeholder="Cari berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 h-12 bg-[#1e293b] border-none rounded-full text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_6px_6px_10px_#0f172a,inset_-6px_-6px_10px_#334155] font-medium transition-shadow"
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
        description={selectedPost ? 'Perbarui data postingan' : 'Tambahkan postingan baru'}
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
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan judul postingan" className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="auto-generated-slug" disabled className="bg-[#e8ecef] border-none rounded-2xl text-slate-500 focus-visible:ring-0 focus-visible:outline-none shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] font-medium px-4 h-12 cursor-not-allowed opacity-80" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus:ring-0 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
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
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kumpulan Gambar (Bisa lebih dari 1)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((url, idx) => (
                            <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden bg-slate-800 flex items-center justify-center group border border-slate-700">
                              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newVals = [...field.value];
                                  newVals.splice(idx, 1);
                                  field.onChange(newVals);
                                }}
                                className="absolute inset-0 bg-red-900/50 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex cursor-pointer text-white"
                              >
                                <Trash2 className="h-5 w-5 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
                          <Input
                            placeholder="Ketik URL manual untuk ditambahkan & tekan tombol + di kanan..."
                            className="w-full pl-12 h-12 bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium transition-shadow"
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
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-12 w-12 rounded-2xl border-none bg-[#1e293b] text-cyan-500 hover:text-cyan-600 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155]"
                          onClick={() => {
                            const inputNode = document.getElementById('manual-url-input') as HTMLInputElement;
                            const val = inputNode?.value.trim();
                            if (val) {
                              field.onChange([...(field.value || []), val]);
                              if (inputNode) inputNode.value = '';
                            }
                          }}
                        >
                          <Plus className="h-5 w-5" strokeWidth={2.5} />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
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
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full h-12 rounded-2xl border-none bg-[#1e293b] text-cyan-500 hover:text-cyan-600 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] font-bold"
                        >
                          {isUploading ? 'Menunggu Proses...' : (
                            <><Upload className="h-5 w-5 mr-2" strokeWidth={2.5} /> Upload Multiple dari PC</>
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
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-3xl bg-[#1e293b] p-6 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                  <div className="space-y-1">
                    <FormLabel className="text-lg font-bold text-slate-300">Publikasikan</FormLabel>
                    <p className="text-sm font-medium text-slate-500">
                      Postingan akan terlihat di website publik
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-[#0f172a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    />
                  </FormControl>
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
