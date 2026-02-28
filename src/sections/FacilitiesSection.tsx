import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, Building2, ImageIcon, Package, Upload } from 'lucide-react';
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
import type { Facility } from '@/types';
import { facilitySchema } from '@/schemas';
import type { FacilityFormData } from '@/schemas';
import {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '@/actions';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import type { ColumnDef } from '@tanstack/react-table';

export function FacilitiesSection() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
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
      formData.append('folder', 'facilities');

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
        toast.success('Foto fasilitas berhasil diunggah');
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

  const form = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: '',
      quantity: 0,
      image_url: '',
    },
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setIsLoading(true);
      const response = await getFacilities();
      if (response.success && response.data) {
        setFacilities(response.data);
      } else {
        toast.error(response.error || 'Gagal memuat data fasilitas');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFacility(null);
    form.reset({
      name: '',
      quantity: 0,
      image_url: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    form.reset({
      name: facility.name,
      quantity: facility.quantity,
      image_url: facility.image_url || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: FacilityFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedFacility) {
        const response = await updateFacility(selectedFacility.id, data);
        if (response.success) {
          toast.success(response.message || 'Fasilitas berhasil diperbarui');
          setIsFormOpen(false);
          loadFacilities();
        } else {
          toast.error(response.error || 'Gagal memperbarui fasilitas');
        }
      } else {
        const response = await createFacility({
          ...data,
          image_url: data.image_url || null,
        });
        if (response.success) {
          toast.success(response.message || 'Fasilitas berhasil ditambahkan');
          setIsFormOpen(false);
          loadFacilities();
        } else {
          toast.error(response.error || 'Gagal menambahkan fasilitas');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedFacility) return;

    try {
      setIsSubmitting(true);
      const response = await deleteFacility(selectedFacility.id);
      if (response.success) {
        toast.success(response.message || 'Fasilitas berhasil dihapus');
        setIsDeleteOpen(false);
        loadFacilities();
      } else {
        toast.error(response.error || 'Gagal menghapus fasilitas');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Facility>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Fasilitas',
      cell: ({ row }) => {
        const facility = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-blue-200">
              <AvatarImage src={facility.image_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-slate-50">{facility.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Jumlah',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-500" />
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {row.original.quantity} unit
          </Badge>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const facility = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(facility)}
              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-950/40"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(facility)}
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
          <h2 className="text-2xl font-bold text-slate-50">Fasilitas</h2>
          <p className="text-slate-500">Kelola sarana dan prasarana sekolah</p>
        </div>
        <Button onClick={handleCreate} className="btn-gold gap-2">
          <Plus className="h-4 w-4" />
          Tambah Fasilitas
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari berdasarkan nama fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 shadow-xl focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredFacilities}
        pageCount={1}
        pageIndex={0}
        pageSize={filteredFacilities.length}
        totalItems={filteredFacilities.length}
        onPageChange={() => { }}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <FormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
        description={selectedFacility ? 'Perbarui data fasilitas' : 'Tambahkan fasilitas baru'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Fasilitas</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama fasilitas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="Masukkan jumlah"
                    />
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
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input {...field} placeholder="https://example.com/image.jpg" className="pl-10" />
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
                        className="border-slate-700 bg-slate-900"
                      >
                        {isUploading ? '...' : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
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
        itemName={selectedFacility?.name}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
