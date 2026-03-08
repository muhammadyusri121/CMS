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
    card: 'bg-white border hover:border-blue-100 border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    icon: 'bg-slate-50 text-slate-500',
    hover: '',
  },
  gold: {
    card: 'bg-white border hover:border-amber-100 border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    icon: 'bg-amber-50 text-amber-500',
    hover: '',
  },
  blue: {
    card: 'bg-white border hover:border-blue-100 border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    icon: 'bg-blue-50 text-blue-500',
    hover: '',
  },
  green: {
    card: 'bg-white border hover:border-emerald-100 border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    icon: 'bg-emerald-50 text-emerald-500',
    hover: '',
  },
  purple: {
    card: 'bg-white border hover:border-purple-100 border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]',
    icon: 'bg-purple-50 text-purple-500',
    hover: '',
  },
};

export function StatsCard({
  title,
  value,
  description,
  trend,
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
          <div className="flex w-full items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-500 tracking-wide">
              {title}
            </h3>
            {trend && (
              <span className={cn('text-[13px] font-bold', trend.isPositive ? 'text-lime-500' : 'text-red-500')}>
                {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 w-full justify-between mt-3">
            <div className="flex flex-col items-start gap-1">
              <span className="text-4xl font-extrabold text-slate-800 tracking-[-0.04em]">{value}</span>
              <span className="text-[11px] font-medium text-slate-400 capitalize">{description}</span>
            </div>

            <div
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
                styles.icon
              )}
            >
              <Icon className="h-8 w-8 stroke-[2]" />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
