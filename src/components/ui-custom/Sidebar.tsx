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
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#ecf0f3] border-none transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 shadow-[15px_0_30px_rgba(209,217,230,0.8)]' : '-translate-x-full lg:translate-x-0'
                    } ${isSidebarCollapsed ? 'lg:w-[90px] w-[280px]' : 'w-[280px]'
                    }`}
            >
                {/* Toggle Button for Desktop */}
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-[#ecf0f3] border-none text-cyan-500 hover:text-cyan-600 transition-all z-50 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]"
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
                </button>

                {/* 1️⃣ Logo Section */}
                <div className={`flex h-32 shrink-0 items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center lg:px-0 px-8' : 'px-8'}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#ecf0f3] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
                            <Hexagon className="h-7 w-7 text-cyan-500 relative z-10" fill="currentColor" strokeWidth={1} />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col flex-nowrap overflow-hidden whitespace-nowrap lg:block hidden">
                                <span className="text-[26px] font-black text-cyan-500 drop-shadow-sm tracking-tight pr-4">C M S</span>
                            </div>
                        )}
                        {isSidebarCollapsed ? null : (
                            <div className="flex flex-col flex-nowrap overflow-hidden whitespace-nowrap lg:hidden">
                                <span className="text-[26px] font-black text-cyan-500 drop-shadow-sm tracking-tight pr-4">C M S</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-5 py-4">
                    <nav className="flex-1 space-y-3">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                    className={`group relative flex items-center overflow-visible rounded-full font-bold transition-all duration-300 ease-in-out ${isActive
                                        ? 'text-white shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]'
                                        : 'text-slate-500 hover:text-cyan-500 shadow-[2px_2px_4px_transparent,-2px_-2px_4px_transparent] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-[52px] w-[52px] mx-auto p-0' : 'px-5 py-3.5 mx-2'}`}
                                >
                                    {isActive ? (
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-[28px]" />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#ecf0f3] rounded-[28px] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300" />
                                    )}
                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isActive ? 'bg-cyan-500 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),2px_2px_8px_rgba(0,0,0,0.1)]' : 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] group-hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-cyan-500'} ${isSidebarCollapsed ? 'mr-0' : 'mr-4'} `}>
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
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out pt-6 ${isSidebarCollapsed ? 'lg:h-0 lg:opacity-0 lg:mb-0 lg:mt-0 mt-6 mb-2 h-auto opacity-100' : 'mt-2 mb-2 h-auto opacity-100'}`}>
                                    <h3 className="px-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap pb-2">
                                        Admin Settings
                                    </h3>
                                </div>
                                <Link
                                    to="/users"
                                    onClick={() => { if (window.innerWidth < 1024) closeMobileMenu(); }}
                                    title={isSidebarCollapsed ? "Pengelola Sistem" : undefined}
                                    className={`group relative flex items-center overflow-visible rounded-full font-bold transition-all duration-300 ease-in-out ${location.pathname === '/users'
                                        ? 'text-white shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]'
                                        : 'text-slate-500 hover:text-cyan-500 shadow-[2px_2px_4px_transparent,-2px_-2px_4px_transparent] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]'
                                        } ${isSidebarCollapsed ? 'flex-col justify-center h-[52px] w-[52px] mx-auto p-0' : 'px-5 py-3.5 mx-2'}`}
                                >
                                    {location.pathname === '/users' ? (
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-[28px]" />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#ecf0f3] rounded-[28px] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300" />
                                    )}
                                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${location.pathname === '/users' ? 'bg-cyan-500 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),2px_2px_8px_rgba(0,0,0,0.1)]' : 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] group-hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-cyan-500'} ${isSidebarCollapsed ? 'mr-0' : 'mr-4'} `}>
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

                {/* Bottom Section (Logout) */}
                <div className="shrink-0 p-6 pt-0">
                    <button
                        onClick={() => logout()}
                        title={isSidebarCollapsed ? "Keluar" : undefined}
                        className={`group relative overflow-hidden flex w-full items-center rounded-full font-bold text-slate-500 bg-[#ecf0f3] hover:text-cyan-500 transition-all duration-300 ease-in-out shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] ${isSidebarCollapsed ? 'flex-col justify-center h-[52px] w-[52px] mx-auto p-0' : 'px-5 py-3.5 mx-2'}`}
                    >
                        <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecf0f3] transition-all duration-300 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] group-hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] text-cyan-500 group-hover:text-red-500 ${isSidebarCollapsed ? 'mr-0' : 'mr-4'} `}>
                            <LogOut className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
                        </div>
                        <span
                            className={`relative z-10 overflow-hidden whitespace-nowrap text-[14px] tracking-wide transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
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
