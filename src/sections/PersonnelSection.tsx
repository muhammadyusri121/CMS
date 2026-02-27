import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, ImageIcon } from 'lucide-react';
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
            <Avatar className="h-10 w-10 border-2 border-blue-200">
              <AvatarImage src={person.image_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                {person.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-50">{person.full_name}</p>
              <p className="text-xs text-slate-500">NIP: {person.nip}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'position',
      header: 'Jabatan',
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: 'sort_order',
      header: 'Urutan',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">{row.original.sort_order}</span>
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
              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-950/40"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(person)}
              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold text-slate-50">Personel Pendidik</h2>
          <p className="text-slate-500">Kelola data tenaga pendidik dan kependidikan</p>
        </div>
        <Button onClick={handleCreate} className="btn-gold gap-2">
          <Plus className="h-4 w-4" />
          Tambah Personel
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari berdasarkan nama, NIP, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
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
        onPageChange={() => {}}
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
                    <Input {...field} placeholder="Masukkan nama lengkap" />
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
                    <Input {...field} placeholder="Masukkan NIP" />
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
                    <Input {...field} placeholder="Masukkan jabatan" />
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
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input {...field} placeholder="https://example.com/image.jpg" className="pl-10" />
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
