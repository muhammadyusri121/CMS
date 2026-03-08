import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/actions';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function UsersSection() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                const res = await updateUser(formData.id, formData);
                if (res.success) {
                    toast.success('Pengguna diperbarui');
                    fetchUsers();
                } else toast.error(res.error || 'Gagal memperbarui');
            } else {
                const res = await createUser(formData);
                if (res.success) {
                    toast.success('Pengguna dibuat');
                    fetchUsers();
                } else toast.error(res.error || 'Gagal membuat pengguna');
            }
            setIsEditing(false);
            setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
        } catch {
            toast.error('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: any) => {
        setIsEditing(true);
        setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus pengguna ini?')) return;
        const res = await deleteUser(id);
        if (res.success) {
            toast.success('Berhasil dihapus');
            fetchUsers();
        } else {
            toast.error(res.error || 'Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kelola Pengelola Utama (Admin)</h1>
                <Button onClick={fetchUsers} variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all font-bold px-4 h-10"><RefreshCw className="mr-2 h-4 w-4" strokeWidth={2.5} />Refresh</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-6">Daftar Pengelola</h2>
                    {loading ? <p>Loading...</p> : (
                        <ul className="space-y-3">
                            {users.map(u => (
                                <li key={u.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-blue-100 transition-all duration-300">
                                    <div>
                                        <p className="font-extrabold text-slate-800">{u.name}</p>
                                        <p className="text-[11px] font-bold text-slate-400">{u.email} &bull; {u.role}</p>
                                    </div>
                                    {u.id !== currentUser?.id && currentUser?.role === 'ADMIN' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(u)} className="h-10 w-10 flex-shrink-0 rounded-xl bg-white text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-slate-200 shadow-sm transition-all"><Edit className="h-4 w-4" strokeWidth={2.5} /></Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(u.id)} className="h-10 w-10 flex-shrink-0 rounded-xl bg-white text-red-500 hover:text-red-600 hover:bg-red-50 border-slate-200 shadow-sm transition-all"><Trash2 className="h-4 w-4" strokeWidth={2.5} /></Button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Form */}
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-6">{isEditing ? 'Edit Pengelola' : 'Tambah Pengelola Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                        <Input name="email" type="email" placeholder="Email Login" value={formData.email} onChange={handleChange} required className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                        <Input name="password" type="password" placeholder={isEditing ? "(Kosongkan jika tidak ingin ubah password)" : "Password Baru"} value={formData.password} onChange={handleChange} required={!isEditing} className="bg-white border-slate-200 rounded-2xl text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-slate-400 shadow-sm font-semibold px-4 h-12" />
                        <select name="role" value={formData.role} onChange={handleChange} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-800 focus-visible:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm font-semibold cursor-pointer">
                            <option value="ADMIN">ADMIN (Super User)</option>
                            <option value="EDITOR">EDITOR (Ubah Konten)</option>
                            <option value="AUTHOR">AUTHOR (Tulis Konten)</option>
                        </select>
                        <div className="flex gap-4 mt-6">
                            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full h-12 shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_24px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 font-bold transition-all border-none text-base">
                                {isEditing ? <Edit className="mr-2 h-5 w-5" strokeWidth={2.5} /> : <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} />}
                                {isEditing ? 'Simpan Data' : 'Tambahkan'}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' }) }} className="rounded-full bg-white text-slate-600 hover:text-slate-800 border-slate-200 shadow-sm font-bold text-base transition-all h-12 px-6">Batal</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
