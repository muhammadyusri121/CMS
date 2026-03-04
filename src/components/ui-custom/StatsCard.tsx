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
    card: 'bg-[#ecf0f3] border-none shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    icon: 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
  },
  gold: {
    card: 'bg-[#ecf0f3] border-none shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    icon: 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
  },
  blue: {
    card: 'bg-[#ecf0f3] border-none shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    icon: 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
  },
  green: {
    card: 'bg-[#ecf0f3] border-none shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    icon: 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
  },
  purple: {
    card: 'bg-[#ecf0f3] border-none shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]',
    icon: 'bg-[#ecf0f3] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] text-cyan-500',
    hover: 'hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]',
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
              'flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] transition-all duration-300 mb-4 group-hover:scale-95 group-hover:shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]',
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
          <div className="w-full h-[45px] flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white font-bold text-xl shadow-[4px_4px_10px_#d1d9e6,-4px_-4px_10px_#ffffff,inset_2px_2px_4px_rgba(255,255,255,0.4)] group-hover:scale-[1.02] transition-transform">
            {value}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
