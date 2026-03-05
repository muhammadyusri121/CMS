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
            <Avatar className="h-10 w-10 border-none bg-[#ecf0f3] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]">
              <AvatarImage src={person.image_url || undefined} className="rounded-full object-cover" />
              <AvatarFallback className="bg-transparent text-cyan-500 text-sm font-bold">
                {person.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-700">{person.full_name}</p>
              <p className="text-xs font-semibold text-slate-400">NIP: {person.nip}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'position',
      header: 'Jabatan',
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#ecf0f3] text-cyan-600 border-none shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] hover:bg-[#ecf0f3] px-3 py-1 font-bold">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: 'Urutan',
      cell: ({ row }) => (
        <span className="text-sm font-bold text-slate-400">{row.original.sort_order}</span>
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
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(person)}
              className="h-10 w-10 rounded-full bg-[#ecf0f3] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(person)}
              className="h-10 w-10 rounded-full bg-[#ecf0f3] text-red-500 hover:text-red-600 border-none shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all"
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
          <h2 className="text-2xl font-bold text-cyan-500 tracking-tight">Personel Pendidik</h2>
          <p className="text-slate-500 font-medium">Kelola data tenaga pendidik dan kependidikan</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-full px-6 h-12 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Personel
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
          <Input
            placeholder="Cari berdasarkan nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 h-12 bg-[#ecf0f3] border-none rounded-full text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_6px_6px_10px_#d1d9e6,inset_-6px_-6px_10px_#ffffff] font-medium transition-shadow"
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
                    <Input {...field} placeholder="Masukkan nama lengkap" className="bg-[#ecf0f3] border-none rounded-2xl text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] font-medium px-4 h-12" />
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
                    <Input {...field} placeholder="Masukkan NIP" className="bg-[#ecf0f3] border-none rounded-2xl text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] font-medium px-4 h-12" />
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
                    <Input {...field} placeholder="Masukkan jabatan" className="bg-[#ecf0f3] border-none rounded-2xl text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] font-medium px-4 h-12" />
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
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
                        <Input {...field} placeholder="https://example.com/image.jpg" className="w-full pl-12 h-12 bg-[#ecf0f3] border-none rounded-2xl text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] font-medium transition-shadow" />
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
                        variant="ghost"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 w-12 rounded-2xl border-none bg-[#ecf0f3] text-cyan-500 hover:text-cyan-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:bg-[#ecf0f3] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]"
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
                      className="bg-[#ecf0f3] border-none rounded-2xl text-slate-600 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] font-medium px-4 h-12"
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
