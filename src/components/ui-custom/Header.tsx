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
    <header className="sticky top-0 z-30 w-full bg-[#ecf0f3] pt-4 pb-2 border-none">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative bg-[#ecf0f3] border-none text-slate-500 hover:text-cyan-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all rounded-full h-10 w-10 overflow-hidden group"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5 relative z-10 font-bold" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-cyan-500 tracking-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 md:gap-5">


          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative bg-[#ecf0f3] border-none text-cyan-500 hover:text-cyan-600 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all rounded-full h-12 w-12 overflow-visible"
              >
                <Bell className="h-[22px] w-[22px] relative z-10 fill-cyan-500" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-none text-white text-[10px] font-bold shadow-md rounded-full">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-slate-200 rounded-2xl p-2 font-medium">
              <DropdownMenuLabel className="font-semibold px-2 py-1.5 text-slate-200">Notifikasi</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10 my-1" />
              <div className="max-h-64 overflow-auto custom-scrollbar">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                  <span className="text-sm font-semibold text-slate-200">Postingan baru ditambahkan</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">2 menit yang lalu</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                  <span className="text-sm font-semibold text-slate-200">Data kelulusan diperbarui</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">1 jam yang lalu</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all">
                  <span className="text-sm font-semibold text-slate-200">Personel baru ditambahkan</span>
                  <span className="text-[10px] font-medium tracking-wide text-slate-500">3 jam yang lalu</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 border-none bg-[#ecf0f3] shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all ml-1">
                <Avatar className="h-10 w-10 rounded-full bg-[#ecf0f3] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" className="rounded-full object-cover border-2 border-transparent" />
                  <AvatarFallback className="bg-cyan-500 text-white font-bold rounded-full">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-slate-200 rounded-2xl p-2 font-medium">
              <DropdownMenuLabel className="font-normal px-2 pb-3 mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold tracking-wide text-white">Admin User</p>
                  <p className="text-[10px] font-medium text-slate-400">admin@sman1ketapang.sch.id</p>
                </div>
              </DropdownMenuLabel>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />
              <DropdownMenuItem className="cursor-pointer focus:bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors">
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300 rounded-xl mt-1 transition-colors">
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
