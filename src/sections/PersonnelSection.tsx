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

export function PersonnelSection() {
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
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip.includes(searchQuery) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<EducationPersonnel>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nama Lengkap',
      cell: ({ row }) => {
        const person = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200 bg-white shadow-sm font-bold">
              <AvatarImage src={person.image_url || undefined} className="rounded-full object-cover" />
              <AvatarFallback className="bg-blue-50 text-blue-600 text-[11px] font-extrabold">
                {person.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-extrabold tracking-tight text-slate-800">{person.full_name}</p>
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
        <Badge variant="secondary" className="bg-slate-50 text-slate-600 border border-slate-100 shadow-sm hover:bg-slate-100 px-3.5 py-1.5 font-bold">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: 'Urutan',
      cell: ({ row }) => (
        <span className="text-[13px] font-extrabold text-slate-500">{row.original.sort_order}</span>
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
              className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl bg-white text-blue-500 hover:text-blue-600 border-slate-200 shadow-sm hover:bg-blue-50 transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(person)}
              className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl bg-white text-red-500 hover:text-red-600 border-slate-200 shadow-sm hover:bg-red-50 transition-all"
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
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Personel Pendidik</h2>
          <p className="text-slate-500 font-semibold mt-1">Kelola data tenaga pendidik dan kependidikan</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 h-12 shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Personel
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
          <Input
            placeholder="Cari berdasarkan nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 h-12 bg-white border border-slate-200 rounded-full text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold transition-all"
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
        description={selectedPersonnel ? 'Perbarui data personel' : 'Tambahkan personel baru'}
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
                    <Input {...field} placeholder="Masukkan nama lengkap" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
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
                    <Input {...field} placeholder="Masukkan NIP" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
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
                    <Input type="email" {...field} placeholder="contoh@sekolah.sch.id" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
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
                    <Input {...field} placeholder="Masukkan jabatan" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
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
                        <Input {...field} placeholder="https://example.com/image.jpg" className="w-full pl-12 h-12 bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold transition-all" />
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
                        className="h-12 w-12 rounded-2xl bg-white border-slate-200 text-blue-500 hover:text-blue-600 shadow-sm hover:bg-blue-50"
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
                      className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12"
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
