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
            <Avatar className="h-12 w-12 border-none shrink-0 shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155]">
              <AvatarImage src={facility.image_url || undefined} />
              <AvatarFallback className="bg-[#1e293b] text-cyan-500 font-bold">
                <Building2 className="h-5 w-5" strokeWidth={2.5} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-200">{facility.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'quantity',
      header: 'Jumlah',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold">
          <Package className="h-5 w-5 text-cyan-500" strokeWidth={2.5} />
          <Badge className="bg-[#1e293b] text-cyan-600 border-none shadow-[2px_2px_5px_#0f172a,-2px_-2px_5px_#334155] hover:bg-[#1e293b] px-3 py-1 font-bold">
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
              className="h-10 w-10 rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(facility)}
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
          <h2 className="text-2xl font-bold text-cyan-500 tracking-tight">Fasilitas</h2>
          <p className="text-slate-500 font-medium">Kelola sarana dan prasarana sekolah</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full px-6 h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Fasilitas
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
          <Input
            placeholder="Cari berdasarkan nama fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 h-12 bg-[#1e293b] border-none rounded-full text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_6px_6px_10px_#0f172a,inset_-6px_-6px_10px_#334155] font-medium transition-shadow"
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
                    <Input {...field} placeholder="Masukkan nama fasilitas" className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
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
                      className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12"
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
                    <div className="flex gap-2 relative items-center">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500 font-bold" />
                        <Input {...field} placeholder="https://example.com/image.jpg" className="w-full pl-12 h-12 bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium transition-shadow" />
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
                        className="h-12 w-12 rounded-2xl border-none bg-[#1e293b] text-cyan-500 hover:text-cyan-600 shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:bg-[#1e293b] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155]"
                      >
                        {isUploading ? '...' : <Upload className="h-5 w-5" strokeWidth={2.5} />}
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
