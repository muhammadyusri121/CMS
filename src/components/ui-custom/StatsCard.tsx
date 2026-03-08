import type { LucideIcon } from 'lucide-react';
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
    icon: 'bg-slate-100 text-slate-500',
  },
  gold: {
    icon: 'bg-amber-50 text-amber-600',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600',
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
    <div
      className={cn(
        'group bg-white border border-slate-200/60 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-default',
        className
      )}
    >
      <div className="p-4 sm:p-5 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </h3>
          {trend && (
            <span className={cn('text-[11px] font-semibold shrink-0', trend.isPositive ? 'text-emerald-600' : 'text-red-500')}>
              {trend.isPositive ? '↑' : '↓'} {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
            {description && (
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-tight mt-0.5">{description}</span>
            )}
          </div>

          <div
            className={cn(
              'flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
              styles.icon
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.8]" />
          </div>
        </div>
      </div>
    </div>
  );
}
