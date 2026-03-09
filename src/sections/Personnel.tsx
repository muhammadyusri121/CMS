import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, ImageIcon, Upload } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { EducationPersonnel } from '@/types';
import { educationPersonnelSchema } from '@/schemas';
import type { EducationPersonnelFormData } from '@/schemas';
import {
  getEducationPersonnel,
  createEducationPersonnel,
  updateEducationPersonnel,
  deleteEducationPersonnel,
} from '@/actions';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import type { ColumnDef } from '@tanstack/react-table';

export function Personnel() {
  const [personnel, setPersonnel] = useState<EducationPersonnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<EducationPersonnel | null>(null);
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
      formData.append('folder', 'personnel');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success && result.data?.url) {
        form.setValue('image_url', result.data.url);
        toast.success('Foto berhasil diunggah');
      } else {
        toast.error(result.error || 'Gagal mengunggah foto');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi saat mengunggah');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const form = useForm<EducationPersonnelFormData>({
    resolver: zodResolver(educationPersonnelSchema),
    defaultValues: {
      full_name: '',
      nip: '',
      email: '',
      position: '',
      image_url: '',
      sort_order: 0,
    },
  });

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = async () => {
    try {
      setIsLoading(true);
      const response = await getEducationPersonnel();
      if (response.success && response.data) {
        setPersonnel(response.data);
      } else {
        toast.error(response.error || 'Gagal memuat data personel');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPersonnel(null);
    form.reset({
      full_name: '',
      nip: '',
      email: '',
      position: '',
      image_url: '',
      sort_order: personnel.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleEdit = (person: EducationPersonnel) => {
    setSelectedPersonnel(person);
    form.reset({
      full_name: person.full_name,
      nip: person.nip,
      email: person.email || '',
      position: person.position,
      image_url: person.image_url || '',
      sort_order: person.sort_order,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (person: EducationPersonnel) => {
    setSelectedPersonnel(person);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: EducationPersonnelFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedPersonnel) {
        const response = await updateEducationPersonnel(selectedPersonnel.id, data);
        if (response.success) {
          toast.success(response.message || 'Personel berhasil diperbarui');
          setIsFormOpen(false);
          loadPersonnel();
        } else {
          toast.error(response.error || 'Gagal memperbarui personel');
        }
      } else {
        const response = await createEducationPersonnel({
          ...data,
          image_url: data.image_url || null,
        } as Omit<EducationPersonnel, 'id' | 'created_at' | 'updated_at'>);
        if (response.success) {
          toast.success(response.message || 'Personel berhasil ditambahkan');
          setIsFormOpen(false);
          loadPersonnel();
        } else {
          toast.error(response.error || 'Gagal menambahkan personel');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedPersonnel) return;

    try {
      setIsSubmitting(true);
      const response = await deleteEducationPersonnel(selectedPersonnel.id);
      if (response.success) {
        toast.success(response.message || 'Personel berhasil dihapus');
        setIsDeleteOpen(false);
        loadPersonnel();
      } else {
        toast.error(response.error || 'Gagal menghapus personel');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPersonnel = personnel.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip?.includes(searchQuery) ||
      p.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<EducationPersonnel>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nama Lengkap',
      cell: ({ row }) => {
        const person = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-200 bg-white">
              <AvatarImage src={person.image_url || undefined} className="rounded-full object-cover" />
              <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-semibold">
                {person.full_name ? person.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PP'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-700 text-sm">{person.full_name}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">NIP: {person.nip}</p>
              {person.email && <p className="text-[10px] font-bold text-blue-500 mt-1">{person.email}</p>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'position',
      header: 'Jabatan',
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-2.5 py-1 text-[11px] font-semibold">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: 'Urutan',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-500">{row.original.sort_order}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const person = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(person)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs transition-colors"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(person)}
              className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs transition-colors"
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
      {/* Header Actions */}
      <div className="flex items-center justify-end">
        <Button onClick={handleCreate} className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm shadow-sm font-medium transition-colors w-auto">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Tambah Personel
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPersonnel}
        pageCount={1}
        pageIndex={0}
        pageSize={filteredPersonnel.length}
        totalItems={filteredPersonnel.length}
        onPageChange={() => { }}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedPersonnel ? 'Edit Personel' : 'Tambah Personel'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama lengkap" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan NIP" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="contoh@sekolah.sch.id" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan jabatan" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Foto</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 relative">
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
                        className="h-10 w-10 rounded-lg bg-white border-slate-200 text-primary-500 hover:text-primary-600 shadow-xs hover:bg-primary-50"
                      >
                        {isUploading ? '...' : <Upload className="h-5 w-5" strokeWidth={2.5} />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="Urutan tampilan"
                      className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10"
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
        itemName={selectedPersonnel?.full_name}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
