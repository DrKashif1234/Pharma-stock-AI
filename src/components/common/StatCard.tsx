import React from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  colorScheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  colorScheme = 'cyan',
  onClick,
  className
}) => {
  const colorMap = {
    cyan: 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/50 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400',
    slate: 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
    indigo: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400'
  };

  const iconBgMap = {
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 relative overflow-hidden flex flex-col justify-between",
        onClick && "cursor-pointer hover:shadow-md hover:border-blue-500/50 transform hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg", iconBgMap[colorScheme])}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>

        {trend && (
          <span
            className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center",
              trend.isNeutral
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                : trend.isPositive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
