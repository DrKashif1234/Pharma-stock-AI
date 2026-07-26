import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />,
          warning: <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />,
          info: <Info className="h-5 w-5 text-cyan-500 flex-shrink-0" />
        };

        const bgStyles = {
          success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200',
          error: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200',
          warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-200',
          info: 'bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-950/80 dark:border-cyan-800 dark:text-cyan-200'
        };

        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0",
              bgStyles[t.type]
            )}
            role="alert"
          >
            <div className="mr-3 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1 text-sm font-medium leading-5">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg focus:outline-none"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
