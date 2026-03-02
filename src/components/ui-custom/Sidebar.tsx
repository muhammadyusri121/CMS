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
    Hexagon,
    Database,
    Calendar
} from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { useLayoutStore } from '@/lib/layoutStore';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Personel Pendidik', href: '/personnel', icon: Users },
    { name: 'Postingan', href: '/posts', icon: FileText },
    { name: 'Data Kelulusan', href: '/graduation', icon: GraduationCap },
    { name: 'Dokumen Akademik', href: '/documents', icon: Files },
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
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1E293B] shadow-[4px_0_24px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isSidebarCollapsed ? 'lg:w-[80px] w-[260px]' : 'w-[260px]'
                    }`}
            >
                {/* Toggle Button for Desktop */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-3.5 top-8 h-7 w-7 items-center justify-center rounded-full bg-[#1E293B] border border-slate-700 text-[#94A3B8] hover:text-white hover:bg-[#334155] transition-colors z-50 shadow-sm"
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                {/* 1️⃣ Logo Section */}
                <div className={`flex h-20 shrink-0 items-center border-b border-slate-700/50 transition-all duration-300 ${isSidebarCollapsed ? 'lg:justify-center justify-start lg:px-0 px-6' : 'px-6'}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <Hexagon className="h-6 w-6 text-white" fill="currentColor" strokeWidth={1} />
                        </div>
                        <div className={`flex flex-col flex-nowrap overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 w-32 opacity-100' : 'w-32 opacity-100'}`}>
                            <span className="text-lg font-bold text-white tracking-wide">SMANKA</span>
                            <span className="text-[10px] text-[#94A3B8] font-semibold tracking-widest uppercase">Dashboard</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-3 py-6">
                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                    className={`group relative flex items-center rounded-2xl px-3 py-3 font-medium transition-all duration-300 ease-in-out ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E5E7EB]'
                                        } ${isSidebarCollapsed ? 'lg:justify-center justify-start' : ''}`}
                                >
                                    <Icon
                                        className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                                            } ${isSidebarCollapsed ? 'lg:mr-0 mr-3' : 'mr-3'}`}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 w-full opacity-100' : 'w-full opacity-100'
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:h-0 lg:opacity-0 lg:mb-0 lg:mt-0 mt-8 mb-3 h-4 opacity-100' : 'mt-8 mb-3 h-4 opacity-100'}`}>
                                    <h3 className="px-4 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">
                                        Admin Settings
                                    </h3>
                                </div>
                                <Link
                                    to="/users"
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? "Pengelola Sistem" : undefined}
                                    className={`group relative flex items-center rounded-2xl px-3 py-3 font-medium transition-all duration-300 ease-in-out ${location.pathname === '/users'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-[#94A3B8] hover:bg-[#334155] hover:text-[#E5E7EB]'
                                        } ${isSidebarCollapsed ? 'lg:justify-center justify-start' : ''}`}
                                >
                                    <UserCog
                                        className={`h-5 w-5 shrink-0 transition-colors duration-300 ${location.pathname === '/users' ? 'text-white' : 'text-[#94A3B8] group-hover:text-white'
                                            } ${isSidebarCollapsed ? 'lg:mr-0 mr-3' : 'mr-3'}`}
                                        aria-hidden="true"
                                    />
                                    <span
                                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 w-full opacity-100' : 'w-full opacity-100'
                                            }`}
                                    >
                                        Pengelola Sistem
                                    </span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                {/* Bottom Section (Logout) */}
                <div className="shrink-0 border-t border-slate-700/50 p-4">
                    <button
                        onClick={() => logout()}
                        title={isSidebarCollapsed ? "Keluar" : undefined}
                        className={`group flex w-full items-center rounded-2xl px-3 py-3 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:justify-center justify-start' : ''}`}
                    >
                        <LogOut
                            className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isSidebarCollapsed ? 'lg:mr-0 mr-3' : 'mr-3'}`}
                            aria-hidden="true"
                        />
                        <span
                            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 w-full opacity-100' : 'w-full opacity-100'
                                }`}
                        >
                            Keluar
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}
