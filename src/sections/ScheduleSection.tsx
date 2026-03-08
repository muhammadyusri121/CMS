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
    }, [search]);

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
                <span className="font-semibold text-primary-600 text-sm">
                    {row.original.day_of_week}
                </span>
            ),
        },
        {
            accessorKey: 'class_name',
            header: 'Kelas',
            cell: ({ row }) => (
                <span className="font-medium text-slate-700 text-sm bg-slate-100 px-2 py-0.5 rounded-md">
                    {row.original.class_name}
                </span>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Mata Pelajaran',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 shrink-0">
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">
                        {row.original.subject}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'time',
            header: 'Waktu',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-medium text-slate-700 text-sm">{row.original.time}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">Jam ke-{row.original.period}</span>
                </div>
            ),
        },
        {
            accessorKey: 'teacher',
            header: 'Guru',
            cell: ({ row }) => {
                const teacher = row.original.teacher;
                return (
                    <div className="flex flex-col">
                        {teacher ? (
                            <>
                                <span className="font-medium text-slate-700 text-sm flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-primary-500" /> {teacher.full_name}
                                </span>
                                <span className="text-[11px] text-slate-400 mt-0.5">NIP: {teacher.nip || '-'}</span>
                            </>
                        ) : (
                            <span className="text-xs text-slate-400 italic">
                                Belum diset
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => handleEdit(row.original)}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-xs"
                        title="Edit"
                    >
                        <Edit className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedItem(row.original);
                            setIsDeleteDialogOpen(true);
                        }}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-xs"
                        title="Hapus"
                    >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    variant="outline"
                    className="flex items-center justify-center gap-2 rounded-lg px-4 h-9 sm:h-10 text-sm font-medium text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:text-primary-600 transition-colors shadow-xs w-full sm:w-auto"
                >
                    <UploadCloud className="h-4 w-4" strokeWidth={2} />
                    Upload Excel
                </Button>
                <Button
                    onClick={() => {
                        setSelectedItem(null);
                        form.reset();
                        setIsDialogOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 h-9 sm:h-10 text-sm shadow-sm font-medium transition-colors w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Tambah Jadwal
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari kelas, NIP, atau mapel..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 h-9 sm:h-10 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-600">Mata Pelajaran</label>
                        <input
                            {...form.register("subject")}
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-400"
                            placeholder="Cth: Matematika"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Kelas</label>
                        <input
                            {...form.register("class_name")}
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-400"
                            placeholder="Cth: X IPA 1"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Hari</label>
                        <select
                            {...form.register("day_of_week")}
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-400"
                        >
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                            <option value="Sabtu">Sabtu</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Jam Ke-</label>
                        <input
                            {...form.register("period")}
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-400"
                            placeholder="Cth: 1-2"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Waktu / Jam</label>
                        <input
                            {...form.register("time")}
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-400"
                            placeholder="Cth: 07:00 - 08:30"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 relative" ref={dropdownRef}>
                        <label className="text-xs font-medium text-slate-600">Guru Pengajar (Opsional)</label>
                        <div
                            onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                            className="w-full flex items-center justify-between h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 cursor-pointer overflow-hidden transition-all hover:bg-slate-50"
                        >
                            <span className="truncate">
                                {form.watch("teacher_nip")
                                    ? (() => {
                                        const t = personnelList.find(p => p.nip === form.watch("teacher_nip"));
                                        return t ? `${t.full_name} (NIP: ${t.nip})` : `NIP: ${form.watch("teacher_nip")}`;
                                    })()
                                    : "Pilih Guru Pengajar..."
                                }
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isTeacherDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isTeacherDropdownOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-dropdown overflow-hidden">
                                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            className="w-full pl-8 pr-3 h-9 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all placeholder:text-slate-400"
                                            placeholder="Cari nama guru atau NIP..."
                                            value={teacherSearchQuery}
                                            onChange={(e) => setTeacherSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                    <div
                                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors"
                                        onClick={() => {
                                            form.setValue("teacher_nip", "");
                                            setIsTeacherDropdownOpen(false);
                                        }}
                                    >
                                        <span className="text-xs font-medium text-slate-400 italic">Kosongkan</span>
                                    </div>
                                    {personnelList.filter(p =>
                                        p.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                                        (p.nip && p.nip.includes(teacherSearchQuery))
                                    ).length === 0 ? (
                                        <div className="px-3 py-6 text-center">
                                            <p className="text-xs text-slate-400">Guru tidak ditemukan.</p>
                                        </div>
                                    ) : (
                                        personnelList.filter(p =>
                                            p.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
                                            (p.nip && p.nip.includes(teacherSearchQuery))
                                        ).map(p => (
                                            <div
                                                key={p.nip || p.id}
                                                className={`px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors flex items-center justify-between ${form.watch("teacher_nip") === p.nip ? 'bg-primary-50/50' : ''}`}
                                                onClick={() => {
                                                    if (p.nip) {
                                                        form.setValue("teacher_nip", p.nip);
                                                    } else {
                                                        toast.info("Guru ini belum memiliki NIP.");
                                                    }
                                                    setIsTeacherDropdownOpen(false);
                                                }}
                                            >
                                                <div className="flex flex-col">
                                                    <div className="font-medium text-slate-700 text-sm">{p.full_name}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{p.nip ? `NIP: ${p.nip}` : 'Belum Ada NIP'}</div>
                                                </div>
                                                {form.watch("teacher_nip") === p.nip && (
                                                    <UserCheck className="w-4 h-4 text-primary-500 mr-1" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        <p className="text-[11px] text-slate-400 pl-0.5 mt-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-primary-400" /> Tertaut otomatis dengan Master Personel.
                        </p>
                    </div>
                </div>
            </FormDialog>

            {/* Upload Dialog Modal */}
            {isUploadDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsUploadDialogOpen(false)} />
                    <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-dialog border border-slate-100">

                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 text-primary-500">
                            <FileSpreadsheet className="w-6 h-6" strokeWidth={2} />
                        </div>

                        <h3 className="text-lg font-semibold text-slate-700 mb-1">Upload File Excel</h3>
                        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                            Format Excel: <b className="text-slate-700">Nama Kelas, Jam Ke, Jam, Mata Pelajaran, NIP Guru, Hari</b>.
                        </p>

                        <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center">
                                <UploadCloud className={`w-8 h-8 mb-3 ${isUploading ? 'text-primary-500 animate-bounce' : 'text-slate-400'}`} strokeWidth={2} />
                                <h4 className="text-sm font-semibold text-slate-700 mb-1">
                                    {isUploading ? 'Sedang mengunggah...' : 'Klik atau Tarik File ke sini'}
                                </h4>
                                <p className="text-[11px] text-slate-400">Format .xlsx dan .xls</p>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsUploadDialogOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
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
