import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/authStore';
import { login } from '@/actions';

const loginSchema = z.object({ 
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginSection() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            // Memanggil API beneran menggunakan action helpers kita
            const response = await login(data);

            if (response.success && response.data?.token) {
                const user = response.data.user;
                setAuth(response.data.token, user);
                toast.success('Login berhasil!');

                const from = location.state?.from?.pathname || '/';
                navigate(from, { replace: true });
            } else {
                toast.error(response.error || 'Email atau password salah');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan koneksi saat login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    SMANKA CMS
                </h2>
                <h3 className="mt-2 text-center text-2xl font-bold text-slate-50">
                    Login ke Akun Anda
                </h3>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Gunakan kredensial admin Anda untuk melanjutkan
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-950 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-800">
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...form.register('email')}
                                    className={form.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}
                                    placeholder="admin@sman1ketapang.sch.id"
                                />
                                {form.formState.errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...form.register('password')}
                                    className={form.formState.errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}
                                    placeholder="••••••••"
                                />
                                {form.formState.errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
                            </Button>
                        </div>

                        <div className="mt-6 border-t border-slate-700 pt-4 text-center text-xs text-slate-500">
                            <p className="font-medium mb-1 text-slate-500">Demo Credentials:</p>
                            <p className="font-mono bg-slate-800 px-2 py-1 rounded inline-block text-blue-700">admin@sman1ketapang.sch.id</p>
                            <p className="mt-1 font-mono bg-slate-800 px-2 py-1 rounded inline-block text-blue-700">password123</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
