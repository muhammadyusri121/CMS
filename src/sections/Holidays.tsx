import { useEffect, useState, useRef } from 'react';
import { Search, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui-custom/DataTable';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';

import {
  deleteAllHolidays,
  deleteSelectedHolidays,
  getHolidays,
  uploadHolidays,
  deleteHoliday,
  createHoliday,
  updateHoliday,
} from '@/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Pencil } from 'lucide-react';
import { SecureDeleteAllDialog } from '@/components/ui-custom/SecureDeleteAllDialog';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { holidaySchema, type HolidayFormData } from '@/schemas';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export function Holidays() {
  const holidayInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHoliday, setIsUploadingHoliday] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isHolidayLoading, setIsHolidayLoading] = useState(true);
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [isHolidayDeleteOpen, setIsHolidayDeleteOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [userCodeInput, setUserCodeInput] = useState('');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      date: '',
      description: '',
    },
  });

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setIsHolidayLoading(true);
      const response = await getHolidays();
      if (response.success && response.data) {
        setHolidays(response.data);
      } else {
        toast.error(response.error || 'Gagal memuat data hari libur');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat memuat data hari libur');
    } finally {
      setIsHolidayLoading(false);
      setRowSelection({});
    }
  };

  const handleCreate = () => {
    setSelectedHoliday(null);
    form.reset({
      date: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  const handleEdit = (h: any) => {
    setSelectedHoliday(h);
    // Format date string for input type="date" (YYYY-MM-DD)
    const d = h.date ? new Date(h.date).toISOString().split('T')[0] : '';
    form.reset({
      date: d,
      description: h.description,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (data: HolidayFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedHoliday) {
        const res = await updateHoliday(selectedHoliday.id, data);
        if (res.success) {
          toast.success('Hari libur berhasil diperbarui');
          setIsFormOpen(false);
          loadHolidays();
        } else {
          toast.error(res.error || 'Gagal memperbarui hari libur');
        }
      } else {
        const res = await createHoliday(data);
        if (res.success) {
          toast.success('Hari libur berhasil ditambahkan');
          setIsFormOpen(false);
          loadHolidays();
        } else {
          toast.error(res.error || 'Gagal menambahkan hari libur');
        }
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAll = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setConfirmCode(result);
    setUserCodeInput('');
    setIsDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = async () => {
    if (userCodeInput.toUpperCase() !== confirmCode) {
        toast.error('Kode konfirmasi tidak cocok');
        return;
    }

    try {
        setIsDeletingAll(true);
        const res = await deleteAllHolidays();
        if (res.success) {
            toast.success('Semua hari libur berhasil dihapus');
            setIsDeleteAllDialogOpen(false);
            loadHolidays();
        } else {
            toast.error(res.error || 'Gagal menghapus semua hari libur');
        }
    } catch (error) {
        toast.error('Terjadi kesalahan koneksi');
    } finally {
        setIsDeletingAll(false);
    }
  };

  const handleDeleteSelection = async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Hapus ${selectedIds.length} hari libur yang dipilih?`)) return;

    try {
        setIsHolidayLoading(true);
        const res = await deleteSelectedHolidays(selectedIds);
        if (res.success) {
            toast.success(res.message || 'Pilihan berhasil dihapus');
            setRowSelection({});
            loadHolidays();
        } else {
            toast.error(res.error || 'Gagal menghapus pilihan');
        }
    } catch (error) {
        toast.error('Terjadi kesalahan koneksi');
    } finally {
        setIsHolidayLoading(false);
    }
  };

  const handleHolidayFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setIsUploadingHoliday(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadHolidays(formData);
      if (response.success) {
        toast.success(response.message || 'Kalender berhasil diunggah');
        loadHolidays(); // Reload data holidays
      } else {
        toast.error(response.error || 'Gagal mengunggah excel');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah');
    } finally {
      setIsUploadingHoliday(false);
      if (holidayInputRef.current) holidayInputRef.current.value = '';
    }
  };

  const handleDeleteHoliday = (doc: any) => {
    setSelectedHoliday(doc);
    setIsHolidayDeleteOpen(true);
  };

  const onDeleteHolidayConfirm = async () => {
    if (!selectedHoliday) return;
    try {
      setIsSubmitting(true);
      const response = await deleteHoliday(selectedHoliday.id);
      if (response.success) {
        toast.success('Hari libur berhasil dihapus');
        setIsHolidayDeleteOpen(false);
        loadHolidays();
      } else {
        toast.error(response.error || 'Gagal menghapus hari libur');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHolidays = holidays.filter(
    (h) => h.description?.toLowerCase().includes(holidaySearchQuery.toLowerCase())
  );

  const holidayColumns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
          <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="translate-y-[2px] border-slate-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
          />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: ({ row }) => {
        const dateObj = row.original.date ? new Date(row.original.date) : null;
        const dateStr = dateObj && !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })
          : '-';
        return <span className="font-medium text-slate-700">{dateStr}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Perayaan / Keterangan',
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.description}</span>,
    },
    {
      id: 'actions',
      header: 'Kelola',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row.original)}
            className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs hover:bg-primary-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDeleteHoliday(row.original)}
            className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
        {holidays.length > 0 && (
          <Button
            onClick={Object.keys(rowSelection).length > 0 ? handleDeleteSelection : handleDeleteAll}
            variant="outline"
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 h-9 sm:h-10 text-sm font-medium transition-colors shadow-xs w-full sm:w-auto",
              Object.keys(rowSelection).length > 0
                ? "text-amber-600 bg-white border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                : "text-rose-600 bg-white border-rose-200 hover:bg-rose-50 hover:border-rose-300"
            )}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {Object.keys(rowSelection).length > 0 ? `Hapus Pilihan (${Object.keys(rowSelection).length})` : 'Hapus Semua'}
          </Button>
        )}
        <Button 
          onClick={handleCreate}
          variant="outline"
          className="flex items-center justify-center gap-2 border-primary-200 text-primary-600 hover:bg-primary-50 rounded-lg px-4 h-9 sm:h-10 text-sm shadow-xs font-medium transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Input Manual
        </Button>
        <div className="w-full sm:w-auto">
          <input
            type="file"
            className="hidden"
            ref={holidayInputRef}
            onChange={handleHolidayFileUpload}
            accept=".xls,.xlsx"
          />
          <Button
            onClick={() => holidayInputRef.current?.click()}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 h-9 sm:h-10 text-sm shadow-sm font-medium transition-colors w-full sm:w-auto"
            disabled={isUploadingHoliday}
          >
            {isUploadingHoliday ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" strokeWidth={2} />}
            {isUploadingHoliday ? 'Memproses...' : 'Upload Excel'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari perayaan atau libur..."
            value={holidaySearchQuery}
            onChange={(e) => setHolidaySearchQuery(e.target.value)}
            className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium"
          />
        </div>
      </div>

      <DataTable
        columns={holidayColumns}
        data={filteredHolidays}
        pageCount={1}
        pageIndex={0}
        pageSize={filteredHolidays.length}
        totalItems={filteredHolidays.length}
        onPageChange={() => { }}
        isLoading={isHolidayLoading}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <DeleteDialog
        open={isHolidayDeleteOpen}
        onOpenChange={setIsHolidayDeleteOpen}
        itemName={selectedHoliday?.description}
        onConfirm={onDeleteHolidayConfirm}
        isDeleting={isSubmitting}
      />

      <FormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          title={selectedHoliday ? 'Edit Hari Libur' : 'Tambah Hari Libur'}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
      >
          <Form {...form}>
              <div className="space-y-4">
                  <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Tanggal</FormLabel>
                              <FormControl>
                                  <Input type="date" {...field} className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Keterangan / Perayaan</FormLabel>
                              <FormControl>
                                  <Input {...field} placeholder="Masukkan keterangan libur" className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
          </Form>
      </FormDialog>

      <SecureDeleteAllDialog
          open={isDeleteAllDialogOpen}
          onOpenChange={setIsDeleteAllDialogOpen}
          confirmCode={confirmCode}
          userCodeInput={userCodeInput}
          setUserCodeInput={setUserCodeInput}
          onConfirm={confirmDeleteAll}
          isDeleting={isDeletingAll}
          title="Hapus Semua Hari Libur"
          description="Anda sedang mencoba menghapus SELURUH data kalender hari libur."
      />
    </div>
  );
}
