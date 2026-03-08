import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayoutStore } from '@/lib/layoutStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle: _subtitle }: HeaderProps) {
  const { toggleMobileMenu } = useLayoutStore();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg h-9 w-9"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
              {title}
            </h1>
            {_subtitle && (
              <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate hidden sm:block">
                {_subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
