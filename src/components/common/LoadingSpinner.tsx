import React from 'react';
import { Pill, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Syncing pharmacy inventory & AI engine...", 
  fullScreen = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
          <Pill className="h-8 w-8 text-cyan-600 dark:text-cyan-400 animate-bounce" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-md">
          <RefreshCw className="h-4 w-4 text-emerald-500 animate-spin" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{message}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Performing real-time safety checks and stock audits...
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
};
