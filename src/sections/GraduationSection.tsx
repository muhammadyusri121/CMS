import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui-custom/DataTable';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { Graduation } from '@/types';
import { graduationSchema } from '@/schemas';
import type { GraduationFormData } from '@/schemas';
import {
  getGraduations,
  createGraduation,
  updateGraduation,
  deleteGraduation,
} from '@/actions';
import { toast } from 'sonner';
import type { ColumnDef, SortingState } from '@tanstack/react-table';

export function GraduationSection() {
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nisnSearch, setNisnSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'created_at', desc: true }]);

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGraduation, setSelectedGraduation] = useState<Graduation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GraduationFormData>({
    resolver: zodResolver(graduationSchema),
    defaultValues: {
      nisn: '',
      student_name: '',
      exam_number: '',
      is_graduated: false,
      graduation_year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    loadGraduations();
  }, [pageIndex, pageSize, sorting, nisnSearch]);

  const loadGraduations = async () => {
    try {
      setIsLoading(true);
      const response = await getGraduations(
        {
          page: pageIndex + 1,
          limit: pageSize,
          sortBy: sorting[0]?.id || 'created_at',
          sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
        },
        nisnSearch || undefined
      );
      if (response.success && response.data) {
        setGraduations(response.data.data);
        setTotalItems(response.data.total);
        setPageCount(response.data.totalPages);
      } else {
        toast.error(response.error || 'Gagal memuat data kelulusan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedGraduation(null);
    form.reset({
      nisn: '',
      student_name: '',
      exam_number: '',
      is_graduated: false,
      graduation_year: new Date().getFullYear(),
    });
    setIsFormOpen(true);
  };

  const handleEdit = (grad: Graduation) => {
    setSelectedGraduation(grad);
    form.reset({
      nisn: grad.nisn,
      student_name: grad.student_name,
      exam_number: grad.exam_number,
      is_graduated: grad.is_graduated,
      graduation_year: grad.graduation_year,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (grad: Graduation) => {
    setSelectedGraduation(grad);
    setIsDeleteOpen(true);
  };

  const onSubmit = async (data: GraduationFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedGraduation) {
        const response = await updateGraduation(selectedGraduation.nisn, data);
        if (response.success) {
          toast.success(response.message || 'Data kelulusan berhasil diperbarui');
          setIsFormOpen(false);
          loadGraduations();
        } else {
          toast.error(response.error || 'Gagal memperbarui data kelulusan');
        }
      } else {
        const response = await createGraduation(data as Omit<Graduation, 'created_at' | 'updated_at'>);
        if (response.success) {
          toast.success(response.message || 'Data kelulusan berhasil ditambahkan');
          setIsFormOpen(false);
          loadGraduations();
        } else {
          toast.error(response.error || 'Gagal menambahkan data kelulusan');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedGraduation) return;

    try {
      setIsSubmitting(true);
      const response = await deleteGraduation(selectedGraduation.nisn);
      if (response.success) {
        toast.success(response.message || 'Data kelulusan berhasil dihapus');
        setIsDeleteOpen(false);
        loadGraduations();
      } else {
        toast.error(response.error || 'Gagal menghapus data kelulusan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Graduation>[] = [
    {
      accessorKey: 'nisn',
      header: 'NISN',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-500" />
          <span className="font-mono font-medium text-slate-50">{row.original.nisn}</span>
        </div>
      ),
    },
    {
      accessorKey: 'student_name',
      header: 'Nama Siswa',
      cell: ({ row }) => (
        <span className="font-medium text-slate-50">{row.original.student_name}</span>
      ),
    },
    {
      accessorKey: 'exam_number',
      header: 'Nomor Ujian',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-500">{row.original.exam_number}</span>
      ),
    },
    {
      accessorKey: 'is_graduated',
      header: 'Status Kelulusan',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.is_graduated ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                Lulus
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                Tidak Lulus
              </Badge>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'graduation_year',
      header: 'Tahun Kelulusan',
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">{row.original.graduation_year}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const grad = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(grad)}
              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-950/40"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(grad)}
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
          <h2 className="text-2xl font-bold text-slate-50">Data Kelulusan</h2>
          <p className="text-slate-500">Kelola data kelulusan siswa</p>
        </div>
        <Button onClick={handleCreate} className="btn-gold gap-2">
          <Plus className="h-4 w-4" />
          Tambah Data
        </Button>
      </div>

      {/* NISN Search */}
      <div className="bg-blue-950/40 border border-blue-200 rounded-xl p-4">
        <label className="text-sm font-medium text-blue-800 mb-2 block">
          Pencarian Berdasarkan NISN
        </label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
          <Input
            placeholder="Masukkan NISN untuk mencari..."
            value={nisnSearch}
            onChange={(e) => {
              setNisnSearch(e.target.value);
              setPageIndex(0);
            }}
            className="pl-10 bg-slate-950 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Masukkan NISN untuk mencari data kelulusan siswa tertentu
        </p>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={graduations}
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
        title={selectedGraduation ? 'Edit Data Kelulusan' : 'Tambah Data Kelulusan'}
        description={selectedGraduation ? 'Perbarui data kelulusan siswa' : 'Tambahkan data kelulusan baru'}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan NISN (10-20 digit)"
                      disabled={!!selectedGraduation}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="student_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Siswa</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama lengkap siswa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exam_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Ujian</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nomor ujian" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduation_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Kelulusan</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                      placeholder="Masukkan tahun kelulusan"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_graduated"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Kelulusan</FormLabel>
                    <p className="text-sm text-slate-500">
                      Tentukan apakah siswa dinyatakan lulus
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
        itemName={selectedGraduation?.student_name}
        onConfirm={onDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
