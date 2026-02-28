import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Hexagon, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-900/10 blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 w-full lg:w-[45%]">
                <div className="mx-auto w-full max-w-sm lg:w-[380px]">
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                            <Hexagon className="h-7 w-7 text-white" fill="currentColor" strokeWidth={1} />
                        </div>
                        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                            SMANKA
                        </h2>
                    </div>

                    <h3 className="mt-8 text-2xl font-bold tracking-tight text-white animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Selamat Datang
                    </h3>
                    <p className="mt-2 text-sm text-slate-400 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Masuk ke dashboard Content Management System untuk mengelola profil sekolah.
                    </p>

                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/50">
                            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5 cursor-pointer">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            {...form.register('email')}
                                            className={`pl-10 bg-slate-950/50 border-slate-700/80 text-white placeholder-slate-500 transition-all duration-300 h-11 ${form.formState.errors.email ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'}`}
                                            placeholder="admin@sman1ketapang.sch.id"
                                        />
                                    </div>
                                    {form.formState.errors.email && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1 animate-in fade-in">
                                            {form.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5 cursor-pointer">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="current-password"
                                            {...form.register('password')}
                                            className={`pl-10 bg-slate-950/50 border-slate-700/80 text-white placeholder-slate-500 transition-all duration-300 h-11 ${form.formState.errors.password ? 'border-red-500 focus-visible:ring-red-500/50' : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'}`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.password && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1 animate-in fade-in">
                                            {form.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full flex justify-center items-center py-2.5 px-4 shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                Masuk ke Dashboard
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side decorative image/graphic */}
            <div className="hidden lg:flex lg:flex-1 relative w-full items-center justify-center bg-slate-950 z-0">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-900/40 via-slate-900 to-slate-950 z-10" />

                {/* Decorative abstract elements */}
                <div className="relative z-20 w-3/5 h-3/5">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full blur-[80px] opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />

                    {/* Glass card floating mockups */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-700 ease-out flex flex-col p-6 overflow-hidden">
                        <div className="w-full h-32 rounded-xl bg-slate-800/50 mb-4 animate-[pulse_3s_ease-in-out_infinite]" />
                        <div className="w-3/4 h-4 rounded bg-slate-700/50 mb-2" />
                        <div className="w-1/2 h-4 rounded bg-slate-700/50 mb-6" />
                        <div className="mt-auto grid grid-cols-2 gap-4">
                            <div className="h-20 rounded-xl bg-blue-500/20 border border-blue-500/20" />
                            <div className="h-20 rounded-xl bg-purple-500/20 border border-purple-500/20" />
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-[70%] -translate-y-[20%] w-64 h-80 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl transform -rotate-12 blur-[1px] -z-10" />
                </div>

                {/* Bottom credentials overlay */}
                <div className="absolute bottom-10 right-10 z-20">
                    <h4 className="text-right text-slate-500 text-sm font-medium tracking-wide">
                        Sistem Informasi Manajemen
                        <br />
                        <span className="text-slate-300 font-bold text-lg">SMAN 1 Ketapang</span>
                    </h4>
                </div>
            </div>
        </div>
    );
}
