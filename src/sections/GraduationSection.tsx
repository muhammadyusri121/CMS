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
      birthday: '',
      gender: '',
      class_name: '',
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
      birthday: '',
      gender: '',
      class_name: '',
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
      birthday: grad.birthday || '',
      gender: grad.gender || '',
      class_name: grad.class_name || '',
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
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-[12px] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
          </div>
          <span className="font-mono font-extrabold text-slate-800 tracking-tight text-[15px]">{row.original.nisn}</span>
        </div>
      ),
    },
    {
      accessorKey: 'student_name',
      header: 'Nama Siswa',
      cell: ({ row }) => (
        <span className="font-extrabold text-slate-800 text-[15px]">{row.original.student_name}</span>
      ),
    },
    {
      accessorKey: 'class_name',
      header: 'Kelas',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-500">{row.original.class_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'L/P',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-500">{row.original.gender || '-'}</span>
      ),
    },
    {
      accessorKey: 'birthday',
      header: 'Tanggal Lahir',
      cell: ({ row }) => (
        <span className="font-semibold text-slate-500">{row.original.birthday || '-'}</span>
      ),
    },
    {
      accessorKey: 'is_graduated',
      header: 'Status Kelulusan',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-bold">
          {row.original.is_graduated ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm hover:bg-emerald-100 px-3 py-1 font-bold">
                Lulus
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" strokeWidth={2.5} />
              <Badge className="bg-red-50 text-red-700 border border-red-100 shadow-sm hover:bg-red-100 px-3 py-1 font-bold">
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
        <span className="text-[15px] font-extrabold text-slate-800">{row.original.graduation_year}</span>
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
              variant="outline"
              size="icon"
              onClick={() => handleEdit(grad)}
              className="h-9 w-9 xl:h-10 xl:w-10 rounded-xl bg-white text-blue-500 hover:text-blue-600 border-slate-200 shadow-sm hover:bg-blue-50 transition-all"
            >
              <Pencil className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(grad)}
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
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Kelulusan</h2>
          <p className="text-slate-500 font-semibold mt-1">Kelola data kelulusan siswa</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 h-12 shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all font-bold group">
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
          Tambah Data
        </Button>
      </div>

      {/* NISN Search */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <label className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
          Pencarian Berdasarkan NISN
        </label>
        <div className="relative max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
          <Input
            placeholder="Masukkan NISN untuk mencari..."
            value={nisnSearch}
            onChange={(e) => {
              setNisnSearch(e.target.value);
              setPageIndex(0);
            }}
            className="w-full pl-14 h-12 bg-white border border-slate-200 rounded-full text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold transition-all"
          />
        </div>
        <p className="text-xs font-medium text-slate-400 mt-3">
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
                      className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12 disabled:opacity-50 disabled:bg-slate-50"
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
                    <Input {...field} placeholder="Masukkan nama lengkap siswa" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cth: XII MIPA 1" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="L / P" className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
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
                      className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12"
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
                <FormItem className="flex items-center justify-between rounded-3xl bg-slate-50 border border-slate-100 p-6 shadow-sm">
                  <div className="space-y-1">
                    <FormLabel className="text-lg font-extrabold text-slate-800">Status Kelulusan</FormLabel>
                    <p className="text-[13px] font-medium text-slate-500">
                      Tentukan apakah siswa dinyatakan lulus
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 shadow-sm"
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
