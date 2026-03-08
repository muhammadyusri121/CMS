import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/actions';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormDialog } from '@/components/ui-custom/FormDialog';
import { DeleteDialog } from '@/components/ui-custom/DeleteDialog';
import { Trash2, Pencil, Plus, RefreshCw, Shield, UserCog } from 'lucide-react';
import { toast } from 'sonner';

const roleBadgeStyles: Record<string, string> = {
    ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
    EDITOR: 'bg-blue-50 text-blue-700 border-blue-200',
    AUTHOR: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function UsersSection() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
    const currentUser = useAuthStore(state => state.user);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers();
            if (res.success && res.data) {
                setUsers(res.data);
            }
        } catch {
            toast.error('Gagal memuat data pengguna');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (isEditing) {
                const res = await updateUser(formData.id, formData);
                if (res.success) {
                    toast.success('Pengguna diperbarui');
                    fetchUsers();
                    setIsFormOpen(false);
                } else toast.error(res.error || 'Gagal memperbarui');
            } else {
                const res = await createUser(formData);
                if (res.success) {
                    toast.success('Pengguna dibuat');
                    fetchUsers();
                    setIsFormOpen(false);
                } else toast.error(res.error || 'Gagal membuat pengguna');
            }
            setIsEditing(false);
            setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
        } catch {
            toast.error('Terjadi kesalahan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreate = () => {
        setIsEditing(false);
        setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
        setIsFormOpen(true);
    };

    const handleEdit = (user: any) => {
        setIsEditing(true);
        setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
        setIsFormOpen(true);
    };

    const handleDeleteClick = (user: any) => {
        setSelectedUserId(user.id);
        setSelectedUserName(user.name);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedUserId) return;
        setIsSubmitting(true);
        const res = await deleteUser(selectedUserId);
        if (res.success) {
            toast.success('Berhasil dihapus');
            fetchUsers();
            setIsDeleteOpen(false);
        } else {
            toast.error(res.error || 'Gagal menghapus');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <div className="flex items-center gap-2">
                    <Button onClick={fetchUsers} variant="outline" size="sm" className="rounded-lg border-slate-200 bg-white text-slate-500 hover:text-primary-600 shadow-xs font-medium h-9 px-3">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />Refresh
                    </Button>
                    <Button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg h-9 px-4 shadow-sm font-medium text-sm transition-colors">
                        <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
                        Tambah Pengelola
                    </Button>
                </div>
            </div>

            {/* User Cards */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary-500 border-t-transparent" />
                        <span className="ml-3 text-sm text-slate-400 font-medium">Memuat data...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                            <UserCog className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Belum ada pengelola</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {u.name ? u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{u.name}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadgeStyles[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        <Shield className="h-3 w-3" />
                                        {u.role}
                                    </span>
                                    {u.id !== currentUser?.id && currentUser?.role === 'ADMIN' && (
                                        <div className="flex gap-1 ml-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(u)} className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-primary-600 hover:border-primary-200 border-slate-200 shadow-xs transition-colors">
                                                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDeleteClick(u)} className="h-8 w-8 rounded-lg bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border-slate-200 shadow-xs transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Dialog */}
            <FormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={isEditing ? 'Edit Pengelola' : 'Tambah Pengelola Baru'}
                description={isEditing ? 'Perbarui data pengelola' : 'Buat akun pengelola baru'}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={isEditing ? 'Simpan' : 'Tambahkan'}
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                        <Input name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Email Login</label>
                        <Input name="email" type="email" placeholder="Email Login" value={formData.email} onChange={handleChange} required className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <Input name="password" type="password" placeholder={isEditing ? "(Kosongkan jika tidak ubah)" : "Password Baru"} value={formData.password} onChange={handleChange} required={!isEditing} className="bg-white border-slate-200 rounded-lg text-slate-800 focus-visible:ring-2 focus-visible:ring-primary-100 placeholder:text-slate-400 shadow-xs font-medium px-3 h-10" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-none focus:ring-2 focus:ring-primary-100 shadow-xs font-medium cursor-pointer">
                            <option value="ADMIN">ADMIN (Super User)</option>
                            <option value="EDITOR">EDITOR (Ubah Konten)</option>
                            <option value="AUTHOR">AUTHOR (Tulis Konten)</option>
                        </select>
                    </div>
                </div>
            </FormDialog>

            {/* Delete Dialog */}
            <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                itemName={selectedUserName}
                onConfirm={handleDeleteConfirm}
                isDeleting={isSubmitting}
            />
        </div>
    )
}
