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
                <h1 className="text-2xl font-bold">Kelola Pengelola Utama (Admin)</h1>
                <Button onClick={fetchUsers} variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Table list */}
                <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">Daftar Pengelola</h2>
                    {loading ? <p>Loading...</p> : (
                        <ul className="space-y-3">
                            {users.map(u => (
                                <li key={u.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-900">
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.email} &bull; {u.role}</p>
                                    </div>
                                    {u.id !== currentUser?.id && currentUser?.role === 'ADMIN' && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(u)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Form */}
                <div className="rounded-xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-xl p-6">
                    <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Pengelola' : 'Tambah Pengelola Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="name" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} required />
                        <Input name="email" type="email" placeholder="Email Login" value={formData.email} onChange={handleChange} required />
                        <Input name="password" type="password" placeholder={isEditing ? "(Kosongkan jika tidak ingin ubah password)" : "Password Baru"} value={formData.password} onChange={handleChange} required={!isEditing} />
                        <select name="role" value={formData.role} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="ADMIN">ADMIN (Super User)</option>
                            <option value="EDITOR">EDITOR (Ubah Konten)</option>
                            <option value="AUTHOR">AUTHOR (Tulis Konten)</option>
                        </select>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white hover:bg-blue-600">
                                {isEditing ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                {isEditing ? 'Simpan' : 'Tambahkan'}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' }) }}>Batal</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
