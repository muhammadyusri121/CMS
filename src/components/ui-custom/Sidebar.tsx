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
    // 2️⃣ Interaksi & Animasi Toggle width state using Zustand
    const { isSidebarCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu } = useLayoutStore();

    // Perhatian: Ini menggunakan react-router-dom alih-alih next/link 
    // karena project aslinya berjalan di ekosistem Vite & React Router DOM
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isAdmin = user?.role === 'ADMIN';

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={closeMobileMenu}
                />
            )}

            <aside
                className={`fixed lg:absolute inset-y-0 left-0 z-50 flex flex-col bg-white border border-slate-200 transition-all duration-300 ease-in-out lg:rounded-[36px] lg:my-0 lg:ml-0 lg:h-[calc(100vh-3rem)] shadow-[0_15px_40px_rgba(0,0,0,0.12)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isSidebarCollapsed ? 'w-[90px]' : 'w-[260px]'
                    }`}
            >
                {/* Toggle Button for Desktop */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-cyan-500 transition-all z-50 shadow-md hover:shadow-lg"
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? <ChevronRight size={16} strokeWidth={2.5} /> : <ChevronLeft size={16} strokeWidth={2.5} />}
                </button>

                {/* 1️⃣ Logo Section */}
                <div className={`flex h-28 shrink-0 items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-8'}`}>
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/30">
                            <span className="text-white font-black text-xl mix-blend-overlay">M</span>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col flex-nowrap overflow-hidden whitespace-nowrap">
                                <span className="text-[22px] font-black text-slate-800 tracking-tight">Bidibet.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-2">
                    <nav className="flex-1 space-y-1.5">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                    className={`group relative flex items-center rounded-2xl font-semibold transition-all duration-200 ease-in-out ${isActive
                                        ? 'text-cyan-600 bg-cyan-50/80 shadow-sm border border-cyan-100/50'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-12 w-12 mx-auto p-0 mb-2' : 'px-4 py-3'}`}
                                >
                                    <div className={`relative z-10 flex shrink-0 items-center justify-center transition-all duration-200 ${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-500'} ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}`}>
                                        <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span
                                        className={`relative z-10 overflow-hidden whitespace-nowrap text-[14px] tracking-wide transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out pt-4 pb-2 ${isSidebarCollapsed ? 'h-0 opacity-0 hidden' : 'h-auto opacity-100'}`}>
                                    <div className="h-px w-full bg-slate-100 mb-4" />
                                    <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        Admin Settings
                                    </h3>
                                </div>
                                <Link
                                    to="/users"
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? "Pengelola Sistem" : undefined}
                                    className={`group relative flex items-center rounded-2xl font-semibold transition-all duration-200 ease-in-out ${location.pathname === '/users'
                                        ? 'text-cyan-600 bg-cyan-50/80 shadow-sm border border-cyan-100/50'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-12 w-12 mx-auto p-0 mt-4' : 'px-4 py-3'}`}
                                >
                                    <div className={`relative z-10 flex shrink-0 items-center justify-center transition-all duration-200 ${location.pathname === '/users' ? 'text-cyan-600' : 'text-slate-400 group-hover:text-cyan-500'} ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}`}>
                                        <UserCog className="h-5 w-5" aria-hidden="true" strokeWidth={location.pathname === '/users' ? 2.5 : 2} />
                                    </div>
                                    <span
                                        className={`relative z-10 overflow-hidden whitespace-nowrap text-[14px] tracking-wide transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
                                            }`}
                                    >
                                        Pengelola Sistem
                                    </span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                {/* Bottom Section (Profile & Logout Layer) */}
                <div className={`shrink-0 p-4 transition-all duration-300 ${isSidebarCollapsed ? 'pb-6' : 'pb-6'}`}>
                    <div className={`bg-slate-50 rounded-[24px] border border-slate-100 transition-all duration-300 ease-in-out flex items-center ${isSidebarCollapsed ? 'p-2 flex-col gap-3 justify-center' : 'p-3 pr-4'}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" alt="Avatar" className="h-[46px] w-[46px] rounded-[16px] object-cover shadow-sm" />
                            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>

                        {/* Details */}
                        {!isSidebarCollapsed && (
                            <div className="ml-3 flex-1 flex flex-col justify-center overflow-hidden">
                                <span className="text-[14px] font-bold text-slate-800 truncate">Sebastian M.</span>
                                <span className="text-[11px] font-medium text-slate-500 truncate">Senior Admin</span>
                            </div>
                        )}

                        {/* Logout Icon Button */}
                        <button
                            onClick={() => logout()}
                            title="Keluar"
                            className={`flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all duration-200 ${isSidebarCollapsed ? 'h-[46px] w-[46px]' : 'h-10 w-10 ml-2'}`}
                        >
                            <LogOut className="h-[18px] w-[18px]" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
