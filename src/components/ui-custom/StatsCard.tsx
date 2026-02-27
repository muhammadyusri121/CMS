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
    card: 'bg-slate-950 border-slate-800/80',
    icon: 'bg-slate-900 text-slate-500',
    value: 'text-slate-200',
  },
  gold: {
    card: 'bg-slate-950 border-slate-800',
    icon: 'bg-blue-950/40 text-blue-600',
    value: 'text-slate-200',
  },
  blue: {
    card: 'bg-slate-950 border-blue-100/60',
    icon: 'bg-blue-950/40 text-blue-600',
    value: 'text-slate-200',
  },
  green: {
    card: 'bg-slate-950 border-emerald-100/60',
    icon: 'bg-emerald-950/40 text-emerald-600',
    value: 'text-slate-200',
  },
  purple: {
    card: 'bg-slate-950 border-purple-100/60',
    icon: 'bg-purple-950/40 text-purple-600',
    value: 'text-slate-200',
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-700/60',
        styles.card,
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex flex-row items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors',
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn('text-2xl font-bold tracking-tight', styles.value)}>
                {value}
              </h3>
            </div>
          </div>
        </div>

        {(description || trend) && (
          <div className="mt-4 flex items-center justify-between">
            {description && (
              <p className="text-xs text-slate-500 truncate mr-2">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center shrink-0">
                <span
                  className={cn(
                    'text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center',
                    trend.isPositive
                      ? 'bg-emerald-950/40 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
