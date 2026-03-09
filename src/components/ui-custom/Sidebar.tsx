import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    GraduationCap,
    Files,
    Activity,
    Building,
    UserCog,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Database,
    Calendar,
    Clock
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { useLayoutStore } from '@/lib/layoutStore';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Personel Pendidik', href: '/personnel', icon: Users },
    { name: 'Postingan', href: '/posts', icon: FileText },
    { name: 'Data Kelulusan', href: '/graduation', icon: GraduationCap },
    { name: 'Dokumen Akademik', href: '/documents', icon: Files },
    { name: 'Jadwal Pelajaran', href: '/schedule', icon: Clock },
    { name: 'Kalender Libur', href: '/holidays', icon: Calendar },
    { name: 'Ekstrakurikuler', href: '/extracurricular', icon: Activity },
    { name: 'Fasilitas', href: '/facilities', icon: Building },
    { name: 'Uji Data API', href: '/test-api', icon: Database },
];

export function Sidebar() {
    const { isSidebarCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu } = useLayoutStore();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isAdmin = user?.role === 'ADMIN';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-screen shadow-card ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isSidebarCollapsed ? 'w-[72px]' : 'w-[250px]'
                    }`}
            >
                {/* Toggle Button for Desktop */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary-600 transition-colors z-50 shadow-xs"
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
                </button>

                {/* Logo Section */}
                <div className={`flex h-16 shrink-0 items-center border-b border-slate-100 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-5'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
                            <span className="text-white font-bold text-sm">S1</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col overflow-hidden whitespace-nowrap">
                                <span className="text-[15px] font-bold text-slate-800 tracking-tight">SMANKA</span>
                                <span className="text-[10px] font-medium text-slate-400">Admin Panel</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-3 py-3">
                    <nav className="flex-1 space-y-0.5">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                    className={`group relative flex items-center rounded-lg font-medium transition-all duration-150 text-[13px] ${isActive
                                        ? 'text-primary-700 bg-primary-50 border border-primary-100'
                                        : 'text-black hover:text-primary-600 hover:bg-slate-50 border border-transparent'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-10 w-10 mx-auto p-0 mb-1' : 'px-3 py-2'
                                        }`}
                                >
                                    <div className={`flex shrink-0 items-center justify-center transition-colors duration-150 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'
                                        } ${isSidebarCollapsed ? 'mr-0' : 'mr-2.5'}`}>
                                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={isActive ? 2.2 : 1.8} />
                                    </div>
                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <>
                                <div className={`transition-all duration-300 ease-in-out pt-3 pb-1 ${isSidebarCollapsed ? 'h-0 opacity-0 hidden' : 'h-auto opacity-100'}`}>
                                    <div className="h-px w-full bg-slate-100 mb-3" />
                                    <h3 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        Admin
                                    </h3>
                                </div>
                                <Link
                                    to="/users"
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? "Pengelola Sistem" : undefined}
                                    className={`group relative flex items-center rounded-lg font-medium transition-all duration-150 text-[13px] ${location.pathname === '/users'
                                        ? 'text-primary-700 bg-primary-50 border border-primary-100'
                                        : 'text-black hover:text-primary-600 hover:bg-slate-50 border border-transparent'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-10 w-10 mx-auto p-0 mt-2' : 'px-3 py-2'
                                        }`}
                                >
                                    <div className={`flex shrink-0 items-center justify-center transition-colors duration-150 ${location.pathname === '/users' ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'
                                        } ${isSidebarCollapsed ? 'mr-0' : 'mr-2.5'}`}>
                                        <UserCog className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={location.pathname === '/users' ? 2.2 : 1.8} />
                                    </div>
                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
                                            }`}
                                    >
                                        Pengelola Sistem
                                    </span>
                                </Link>
                            </>
                        )}

                        {/* Bottom Section (Logout Only) */}
                        <div className="mt-8 pt-3 border-t border-slate-100">
                            {/* Prominent Logout Button */}
                            <button
                                onClick={() => logout()}
                                className={`group flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 font-semibold text-[13px] ${isSidebarCollapsed ? 'p-2.5' : 'py-2.5 px-3'
                                    }`}
                                title="Keluar"
                            >
                                <LogOut className="h-[18px] w-[18px] group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                                {!isSidebarCollapsed && <span>Keluar Sistem</span>}
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    );
}
