import { Bell, User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/lib/layoutStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle: _subtitle }: HeaderProps) {
  const { toggleMobileMenu } = useLayoutStore();

  return (
    <header className="sticky top-0 z-30 w-full bg-transparent pt-4 pb-2 border-none">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative bg-white border border-slate-200 text-slate-500 hover:text-cyan-500 shadow-sm rounded-full h-10 w-10 overflow-hidden group"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5 relative z-10 font-bold" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
              Hello! Admin
            </h1>
            {_subtitle && (
              <p className="text-sm font-medium text-slate-500 mt-1">
                Take a look and provide seamless experience to the app users.
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* Central Notification / Action Alert (Mocking Approve Card) */}
          <div className="hidden lg:flex mr-6 animate-pulse">
            <div className="bg-white px-5 py-2 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">New Action Required</span>
                <span className="text-sm font-black text-slate-800">Pending Approvals</span>
              </div>
              <Button className="h-8 rounded-xl px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">
                View
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-white border border-slate-200 text-slate-400 hover:text-cyan-500 shadow-sm hover:shadow-md transition-all rounded-full h-11 w-11 overflow-visible"
              >
                <Bell className="h-5 w-5 relative z-10" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white text-white text-[10px] font-bold shadow-md rounded-full">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-slate-800 rounded-2xl p-2 font-medium">
              <DropdownMenuLabel className="font-semibold px-2 py-1.5 text-slate-800">Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <div className="max-h-64 overflow-auto custom-scrollbar">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-sm font-semibold text-slate-800">Postingan baru ditambahkan</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">2 menit yang lalu</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-sm font-semibold text-slate-800">Data kelulusan diperbarui</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">1 jam yang lalu</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-sm font-semibold text-slate-800">Personel baru ditambahkan</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">3 jam yang lalu</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 border border-slate-200 shadow-sm hover:shadow-md transition-all ml-1">
                <Avatar className="h-10 w-10 rounded-full bg-slate-100">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" className="rounded-full object-cover" />
                  <AvatarFallback className="bg-cyan-500 text-white font-bold rounded-full">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-slate-800 rounded-2xl p-2 font-medium">
              <DropdownMenuLabel className="font-normal px-2 pb-3 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold tracking-wide text-slate-800">Admin User</p>
                  <p className="text-[10px] font-medium text-slate-500">admin@sman1ketapang.sch.id</p>
                </div>
              </DropdownMenuLabel>
              <div className="h-[1px] bg-slate-100 my-1" />
              <DropdownMenuItem className="cursor-pointer focus:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 transition-colors">
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 rounded-xl mt-1 transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
