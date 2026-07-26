import React from 'react';
import { PackageOpen, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Inventory Records Found",
  description = "No medicines or transactions match your current search filters or criteria.",
  actionLabel,
  onAction,
  icon,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        {icon || <PackageOpen className="h-8 w-8 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "System Synchronization Error",
  message = "An error occurred while communicating with the inventory backend.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 max-w-xl mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-rose-700 dark:text-rose-300 max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
