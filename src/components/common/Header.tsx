import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Search, 
  QrCode, 
  Plus, 
  Sparkles, 
  Moon, 
  Sun, 
  Menu, 
  Bell, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    activePage, 
    setActivePage, 
    isDarkMode, 
    toggleDarkMode, 
    openQRScanner, 
    openAddMedicineModal,
    openAIAssistantWithQuery,
    metrics,
    refreshData,
    loading,
    filters,
    setFilters
  } = useApp();

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Healthcare Inventory Overview', subtitle: 'Real-time metrics, stock distribution, and live clinical alerts' },
    inventory: { title: 'Medicine Inventory Management', subtitle: 'Centralized directory of pharmaceutical stock and batch records' },
    qr: { title: 'QR Code Stock Operations', subtitle: 'Scan barcodes or generate labels for instantaneous medicine verification' },
    stock: { title: 'Stock In & Stock Out Logging', subtitle: 'Record purchases, dispensing, return, and disposal transactions' },
    expiry: { title: 'Automated Expiry & Quarantine Monitoring', subtitle: '30/60/90 day expiry breakdown and patient safety alerts' },
    ai: { title: 'PharmaStock AI Clinical Assistant', subtitle: 'Powered by Google Gemini 3.6 Flash for intelligent inventory synthesis' },
    reports: { title: 'Regulatory Reports & Analytics Export', subtitle: 'Generate downloadable PDF, Excel (.xlsx), and CSV audit files' },
    suppliers: { title: 'Authorized Pharmaceutical Suppliers', subtitle: 'Directory of wholesale vendors and logistics contact channels' }
  };

  const currentInfo = pageTitles[activePage] || { title: 'PharmaStock AI', subtitle: 'Pharmacy Inventory System' };

  const totalAlerts = (metrics?.expiredCount || 0) + (metrics?.outOfStockCount || 0) + (metrics?.lowStockCount || 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilters(prev => ({ ...prev, search: val }));
    if (activePage !== 'inventory' && activePage !== 'expiry' && val.trim().length > 0) {
      setActivePage('inventory');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{currentInfo.title}</span>
              {loading && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500 inline-block" />
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Mobile quick icons */}
        <div className="flex items-center space-x-2 md:hidden">
          <button
            onClick={openQRScanner}
            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
            title="Scan QR"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Action Bar: Search & Quick Buttons in Bento style */}
      <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
        {/* Global Search (Bento style) */}
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines, batches, or QR codes..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>

        {/* Pharmacy info from Bento Design */}
        <div className="hidden xl:block text-right border-l border-slate-200 dark:border-slate-800 pl-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Central Plaza Pharmacy</div>
          <div className="text-[10px] text-slate-400">Last sync: 2 mins ago</div>
        </div>

        {/* Quick Actions Group */}
        <div className="flex items-center space-x-2">
          {/* Refresh button */}
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>

          {/* Alert Notifications Badge */}
          <button
            onClick={() => setActivePage('expiry')}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`${totalAlerts} Attention Items`}
          >
            <Bell className="h-5 w-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {/* QR Scan Button */}
          <button
            onClick={openQRScanner}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all"
            title="Launch QR Barcode Scanner"
          >
            <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Scan QR</span>
          </button>

          {/* AI Quick Query Button */}
          <button
            onClick={() => openAIAssistantWithQuery()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-sm transition-all"
            title="Ask AI Assistant"
          >
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>

          {/* Add Medicine Button */}
          <button
            onClick={openAddMedicineModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">Add Medicine</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
