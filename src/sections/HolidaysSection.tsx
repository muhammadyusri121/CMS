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
    (h) => h.description?.toLowerCase().includes(holidaySearchQuery.toLowerCase())
  );

  const holidayColumns: ColumnDef<any>[] = [
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
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDeleteHoliday(row.original)}
          className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div>
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
