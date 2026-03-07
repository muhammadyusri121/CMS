import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'gold' | 'blue' | 'green' | 'purple';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
    icon: 'bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]',
  },
  gold: {
    card: 'bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
    icon: 'bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]',
  },
  blue: {
    card: 'bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
    icon: 'bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]',
  },
  green: {
    card: 'bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
    icon: 'bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]',
  },
  purple: {
    card: 'bg-[#1e293b] border-none shadow-[8px_8px_16px_#0f172a,-8px_-8px_16px_#334155]',
    icon: 'bg-[#1e293b] shadow-[inset_4px_4px_8px_#0f172a,inset_-4px_-4px_8px_#334155] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#0f172a,-4px_-4px_8px_#334155]',
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 rounded-[30px] cursor-pointer',
        styles.card,
        styles.hover,
        className
      )}
    >
      <CardContent className="p-6 relative z-10 flex flex-col items-center justify-between text-center h-full min-h-[220px]">

        <div className="flex flex-col items-center w-full">
          <div
            className={cn(
              'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] transition-all duration-300 mb-4 group-hover:scale-95 group-hover:shadow-[inset_6px_6px_12px_#0f172a,inset_-6px_-6px_12px_#334155]',
              styles.icon
            )}
          >
            <Icon className="h-7 w-7 transition-all stroke-[2.5]" />
          </div>

          <p className="text-[13px] font-semibold text-slate-500 tracking-wide mb-6">
            {title}
          </p>
        </div>

        <div className="w-full mt-auto">
          <div className="w-full h-[45px] flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-xl shadow-[4px_4px_10px_#0f172a,-4px_-4px_10px_#334155,inset_2px_2px_4px_rgba(255,255,255,0.4)] group-hover:scale-[1.02] transition-transform">
            {value}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
