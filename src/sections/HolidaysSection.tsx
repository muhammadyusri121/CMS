import { useEffect, useState, useRef } from 'react';
import { Search, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui-custom/DataTable';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';

import {
  getHolidays,
  uploadHolidays,
  deleteHoliday,
} from '@/actions';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

export function HolidaysSection() {
  const holidayInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHoliday, setIsUploadingHoliday] = useState(false);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [isHolidayLoading, setIsHolidayLoading] = useState(true);
  const [holidaySearchQuery, setHolidaySearchQuery] = useState('');
  const [isHolidayDeleteOpen, setIsHolidayDeleteOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    (h) => h.description.toLowerCase().includes(holidaySearchQuery.toLowerCase())
  );

  const holidayColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: ({ row }) => {
        const dateStr = new Date(row.original.date).toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        return <span className="text-slate-50">{dateStr}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Perayaan / Keterangan',
      cell: ({ row }) => <span className="text-slate-50 font-medium">{row.original.description}</span>,
    },
    {
      id: 'actions',
      header: 'Kelola',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteHoliday(row.original)}
          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Kalender Akademik (Libur & Perayaan)</h2>
          <p className="text-slate-500">Kelola jadwal hari libur akademik dengan mengunggah format Excel</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            ref={holidayInputRef}
            onChange={handleHolidayFileUpload}
            accept=".xls,.xlsx"
          />
          <Button
            onClick={() => holidayInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-900/20"
            disabled={isUploadingHoliday}
          >
            {isUploadingHoliday ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {isUploadingHoliday ? 'Memproses...' : 'Upload Excel Kalender'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari perayaan atau libur..."
            value={holidaySearchQuery}
            onChange={(e) => setHolidaySearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 shadow-xl focus:border-blue-500 focus:ring-blue-500/20"
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
      />

      <DeleteDialog
        open={isHolidayDeleteOpen}
        onOpenChange={setIsHolidayDeleteOpen}
        itemName={selectedHoliday?.description}
        onConfirm={onDeleteHolidayConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
