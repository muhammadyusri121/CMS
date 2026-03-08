import { useEffect, useState, useRef } from 'react';
import {
    Plus,
    Trash2,
    Edit,
    Search,
    BookOpen,
    UploadCloud,
    FileSpreadsheet,
    Clock,
    UserCheck,
    ChevronDown
} from 'lucide-react';
import { DataTable } from '@/components/ui-custom/DataTable';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    uploadSchedules,
    getEducationPersonnel
} from '@/actions';

// Zod schema for manual schedule
const scheduleSchema = z.object({
    class_name: z.string().min(1, 'Nama kelas wajib diisi'),
    period: z.string().min(1, 'Jam ke- wajib diisi'),
    time: z.string().min(1, 'Waktu (Jam) wajib diisi'),
    subject: z.string().min(1, 'Mata pelajaran wajib diisi'),
    day_of_week: z.string().min(1, 'Hari wajib diisi'),
    teacher_nip: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function ScheduleSection() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Selection states
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Teacher dropdown states
    const [personnelList, setPersonnelList] = useState<any[]>([]);
    const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            class_name: '',
            period: '',
            time: '',
            subject: '',
            day_of_week: 'Senin',
            teacher_nip: '',
        },
    });

    useEffect(() => {
        loadData();
    }, [search]); // Adding search dependency to reload on search

    useEffect(() => {
        const fetchPersonnel = async () => {
            try {
                const res = await getEducationPersonnel();
                if (res.success) setPersonnelList(res.data);
            } catch (e) { console.error('Gagal memuat GTK', e); }
        };
        fetchPersonnel();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTeacherDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await getSchedules({ limit: 100, search: search });
            if (res.success) {
                setData(res.data.data);
            } else {
                toast.error('Gagal memuat jadwal sekolah');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan koneksi');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (values: ScheduleFormValues) => {
        try {
            let res;
            if (selectedItem) {
                res = await updateSchedule(selectedItem.id, values);
            } else {
                res = await createSchedule(values);
            }

            if (res.success) {
                toast.success(selectedItem ? 'Jadwal diperbarui' : 'Jadwal ditambahkan');
                setIsDialogOpen(false);
                loadData();
            } else {
                toast.error(res.error || 'Gagal menyimpan draf');
            }
        } catch (error) {
            toast.error('Gagal menyimpan draf ke database');
        }
    };

    const handleEdit = (item: any) => {
        setSelectedItem(item);
        form.reset({
            class_name: item.class_name,
            period: item.period,
            time: item.time,
            subject: item.subject,
            day_of_week: item.day_of_week,
            teacher_nip: item.teacher_nip || '',
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            const res = await deleteSchedule(selectedItem.id);
            if (res.success) {
                toast.success('Jadwal berhasil dihapus');
                setIsDeleteDialogOpen(false);
                loadData();
            } else {
                toast.error(res.error || 'Gagal menghapus jadwal');
            }
        } catch (error) {
            toast.error('Gagal menghapus jadwal');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await uploadSchedules(formData);

            if (res.success) {
                toast.success(res.message || 'File Excel berhasil diunggah');
                setIsUploadDialogOpen(false);
                loadData();
            } else {
                toast.error(res.error || 'Gagal memproses Excel');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat mengunggah');
        } finally {
            setIsUploading(false);
            // reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'day_of_week',
            header: 'Hari',
            cell: ({ row }) => (
                <span className="font-extrabold text-blue-600 tracking-wide text-[15px]">
                    {row.original.day_of_week}
                </span>
            ),
        },
        {
            accessorKey: 'class_name',
            header: 'Kelas',
            cell: ({ row }) => (
                <span className="font-bold text-slate-800 tracking-tight text-[15px] bg-slate-100 px-3 py-1 rounded-xl">
                    {row.original.class_name}
                </span>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Mata Pelajaran',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 shrink-0">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-slate-800 text-[15px]">
                            {row.original.subject}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'time',
            header: 'Waktu / Jam Ke',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-700 text-[15px]">{row.original.time}</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-400">Jam ke-{row.original.period}</span>
                </div>
            ),
        },
        {
            accessorKey: 'teacher',
            header: 'Guru Pengajar',
            cell: ({ row }) => {
                const teacher = row.original.teacher;
                return (
                    <div className="flex flex-col">
                        {teacher ? (
                            <>
                                <span className="font-bold text-slate-800 text-[15px] flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-blue-500" /> {teacher.full_name}
                                </span>
                                <span className="text-[12px] font-semibold text-slate-400 mt-0.5">NIP: {teacher.nip || '-'}</span>
                            </>
                        ) : (
                            <span className="text-[14px] font-medium text-slate-400 italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                Belum ada (NIP: {row.original.teacher_nip || 'Tidak diset'})
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 pr-4">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                        title="Edit"
                    >
                        <Edit className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedItem(row.original);
                            setIsDeleteDialogOpen(true);
                        }}
                        className="flex items-center justify-center h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                        title="Hapus"
                    >
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Jadwal Pelajaran</h2>
                    <p className="text-slate-500 font-semibold mt-1">Atur jadwal pelajaran sekolah untuk semua kelas</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsUploadDialogOpen(true)}
                        variant="outline"
                        className="flex items-center gap-2 rounded-full px-6 h-12 font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <UploadCloud className="h-5 w-5" strokeWidth={2.5} />
                        Upload Excel
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedItem(null);
                            form.reset();
                            setIsDialogOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-6 h-12 shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all font-bold group"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                        Tambah Jadwal
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 font-bold" />
                    <Input
                        placeholder="Cari kelas, NIP, atau mapel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 h-12 bg-white border border-slate-200 rounded-full text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold transition-all"
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                pageCount={1}
                pageIndex={0}
                pageSize={100}
                totalItems={data.length}
                onPageChange={() => { }}
                isLoading={isLoading}
            />

            {/* Dialog Form for Manual Add/Edit */}
            <FormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={selectedItem ? "Edit Jadwal" : "Tambah Jadwal Manual"}
                description={selectedItem ? "Ubah data jadwal" : "Tambahkan jadwal baru"}
                onSubmit={form.handleSubmit(onSubmit)}
                isSubmitting={isUploading}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                        <label className="text-[13px] font-bold text-slate-700">Mata Pelajaran</label>
                        <input
                            {...form.register("subject")}
                            className="w-full flex h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 disabled:opacity-50"
                            placeholder="Cth: Matematika"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Kelas</label>
                        <input
                            {...form.register("class_name")}
                            className="w-full flex h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                            placeholder="Cth: X IPA 1"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Hari</label>
                        <select
                            {...form.register("day_of_week")}
                            className="w-full flex h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                        >
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Sabtu">Sabtu</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Jam Ke-</label>
                        <input
                            {...form.register("period")}
                            className="w-full flex h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                            placeholder="Cth: 1-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">Waktu / Jam</label>
                        <input
                            {...form.register("time")}
                            className="w-full flex h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                            placeholder="Cth: 07:00 - 08:30"
                        />
                    </div>

                    <div className="space-y-2 col-span-2 mt-2 relative" ref={dropdownRef}>
                        <label className="text-[13px] font-bold text-slate-700">Guru Pengajar (Opsional)</label>
                        <div
                            onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            className="w-full flex items-center justify-between h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-bold text-slate-800 cursor-pointer overflow-hidden transition-all hover:bg-slate-100/70"
                        >
                            <span className="truncate">
                                {form.watch("teacher_nip")
                                    ? (() => {
                                        const t = personnelList.find(p => p.nip === form.watch("teacher_nip"));
                                        return t ? `${t.full_name} (NIP: ${t.nip})` : `NIP Tertaut: ${form.watch("teacher_nip")}`;
                                    })()
                                    : "Pilih Guru Pengajar..."
                                }
                            </span>
                            <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isTeacherDropdownOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            className="w-full xl pl-9 pr-4 h-10 rounded-xl bg-white border border-slate-200 text-[14px] font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                            placeholder="Cari nama guru atau NIP..."
                                            value={teacherSearchQuery}
                                            onChange={(e) => setTeacherSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    <div
                                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors"
                                        onClick={() => {
                                            form.setValue("teacher_nip", "");
                                            setIsTeacherDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-[14px] font-bold text-slate-400 italic">Tidak Diset / Kosongkan</span>
                                    </div>
                                    {personnelList.filter(p =>
                                        p.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                                        (p.nip && p.nip.includes(teacherSearchQuery))
                                    ).length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <p className="text-[14px] font-medium text-slate-400">Guru tidak ditemukan.</p>
                                        </div>
                                    ) : (
                                        personnelList.filter(p =>
                                            p.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                                            (p.nip && p.nip.includes(teacherSearchQuery))
                                        ).map(p => (
                                            <div
                                                key={p.nip || p.id}
                                                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors flex items-center justify-between ${form.watch("teacher_nip") === p.nip ? 'bg-blue-50/50' : ''}`}
                                                onClick={() => {
                                                    if (p.nip) {
                                                        form.setValue("teacher_nip", p.nip);
                                                    } else {
                                                        toast.info("Guru ini belum memiliki NIP yang tersimpan di Master Data.");
                                                    }
                                                    setIsTeacherDropdownOpen(false);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <div className="font-extrabold text-slate-800 text-[14.5px]">{p.full_name}</div>
                                                    <div className="text-[12px] font-semibold text-slate-500 mt-0.5">{p.nip ? `NIP: ${p.nip}` : 'Belum Ada NIP'}</div>
                                                </div>
                                                {form.watch("teacher_nip") === p.nip && (
                                                    <UserCheck className="w-5 h-5 text-blue-500 mr-2" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <p className="text-[12.5px] font-semibold text-slate-500 pl-1 mt-1.5 flex items-center gap-1.5 opacity-90">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Profil tertaut otomatis dengan Master Personel Pendidik.
                        </p>
                    </div>
                </div>
            </FormDialog>

            {/* Upload Dialog Modal */}
            {isUploadDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsUploadDialogOpen(false)} />
                    <div className="relative w-full max-w-lg rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200 border border-slate-100">

                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 border border-blue-100 shadow-sm">
                            <FileSpreadsheet className="w-8 h-8" strokeWidth={2.5} />
                        </div>

                        <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">Upload File Excel</h3>
                        <p className="text-slate-500 font-medium text-[15px] mb-6 leading-relaxed">
                            Gunakan format Excel standar dengan kolom: <b className="text-slate-700">Nama Kelas, Jam Ke, Jam, Mata Pelajaran, NIP Guru Pengajar, Hari</b>. Pastikan NIP sesuai dengan direktori guru agar relasi terbaca sistem.
                        </p>

                        <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors rounded-[24px] p-8 text-center cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center">
                                <UploadCloud className={`w-12 h-12 mb-4 ${isUploading ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} strokeWidth={2} />
                                <h4 className="text-lg font-bold text-slate-700 mb-1">
                                    {isUploading ? 'Sedang mengunggah...' : 'Klik atau Tarik File Excel ke sini'}
                                </h4>
                                <p className="text-[13px] font-medium text-slate-400">Mendukung format .xlsx dan .xls</p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsUploadDialogOpen(false)}
                                className="px-6 py-3 text-[14px] font-bold tracking-wide text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-all"
                                disabled={isUploading}
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleDelete}
                title="Hapus Jadwal"
                description="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
}
