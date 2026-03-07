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
                <h1 className="text-2xl font-bold text-cyan-500 tracking-tight">Kelola Pengelola Utama (Admin)</h1>
                <Button onClick={fetchUsers} variant="ghost" size="sm" className="rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all font-bold px-4 h-10"><RefreshCw className="mr-2 h-4 w-4" strokeWidth={2.5} />Refresh</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-[#1e293b] border-none rounded-3xl p-6 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                    <h2 className="text-xl font-bold text-cyan-600 mb-6">Daftar Pengelola</h2>
                    {loading ? <p>Loading...</p> : (
                        <ul className="space-y-3">
                            {users.map(u => (
                                <li key={u.id} className="flex items-center justify-between p-4 border-none rounded-2xl shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] hover:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all duration-300">
                                    <div>
                                        <p className="font-bold text-slate-200">{u.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{u.email} &bull; {u.role}</p>
                                    </div>
                                    {u.id !== currentUser?.id && currentUser?.role === 'ADMIN' && (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="h-10 w-10 flex-shrink-0 rounded-full bg-[#1e293b] text-cyan-500 hover:text-cyan-600 border-none shadow-[2px_2px_5px_#0f172a,-2px_-2px_5px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"><Edit className="h-4 w-4" strokeWidth={2.5} /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-10 w-10 flex-shrink-0 rounded-full bg-[#1e293b] text-red-500 hover:text-red-600 border-none shadow-[2px_2px_5px_#0f172a,-2px_-2px_5px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all"><Trash2 className="h-4 w-4" strokeWidth={2.5} /></Button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Form */}
                <div className="bg-[#1e293b] border-none rounded-3xl p-6 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155]">
                    <h2 className="text-xl font-bold text-cyan-600 mb-6">{isEditing ? 'Edit Pengelola' : 'Tambah Pengelola Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                        <Input name="email" type="email" placeholder="Email Login" value={formData.email} onChange={handleChange} required className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                        <Input name="password" type="password" placeholder={isEditing ? "(Kosongkan jika tidak ingin ubah password)" : "Password Baru"} value={formData.password} onChange={handleChange} required={!isEditing} className="bg-[#1e293b] border-none rounded-2xl text-slate-300 focus-visible:ring-0 focus-visible:outline-none placeholder:text-slate-400 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium px-4 h-12" />
                        <select name="role" value={formData.role} onChange={handleChange} className="h-12 w-full rounded-2xl border-none bg-[#1e293b] px-4 py-2 text-slate-300 focus-visible:outline-none focus-visible:ring-0 shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] font-medium cursor-pointer">
                            <option value="ADMIN">ADMIN (Super User)</option>
                            <option value="EDITOR">EDITOR (Ubah Konten)</option>
                            <option value="AUTHOR">AUTHOR (Tulis Konten)</option>
                        </select>
                        <div className="flex gap-4 mt-6">
                            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full h-12 shadow-[6px_6px_12px_#0f172a,-6px_-6px_12px_#334155] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)] font-bold transition-all border-none text-base">
                                {isEditing ? <Edit className="mr-2 h-5 w-5" strokeWidth={2.5} /> : <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} />}
                                {isEditing ? 'Simpan Data' : 'Tambahkan'}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' }) }} className="rounded-full bg-[#1e293b] text-slate-500 hover:text-cyan-600 border-none shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155] active:shadow-[inset_2px_2px_4px_#0f172a,inset_-2px_-2px_4px_#334155] transition-all h-12 px-6 font-bold text-base">Batal</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
