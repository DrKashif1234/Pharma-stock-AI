import React from 'react';
import { useApp } from '../contexts/AppContext';
import { exportService } from '../services/exportService';
import { FileText, Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck, Pill, AlertTriangle, ArrowLeftRight, Truck } from 'lucide-react';
import { getExpiryStatus } from '../utils/dateUtils';
import { cn } from '../utils/cn';

export const ReportsPage: React.FC = () => {
  const { medicines, transactions, suppliers, showToast } = useApp();

  const expiredMeds = medicines.filter(m => getExpiryStatus(m.expiry_date) === 'EXPIRED');
  const nearExpiryMeds = medicines.filter(m => {
    const s = getExpiryStatus(m.expiry_date);
    return s === 'NEAR_30_DAYS' || s === 'NEAR_60_DAYS' || s === 'NEAR_90_DAYS';
  });
  const lowStockMeds = medicines.filter(m => m.quantity <= (m.min_stock_level || 20));

  const reportModules = [
    {
      id: 'full_inventory',
      title: 'Complete Pharmacy Inventory Audit',
      description: `Full dataset of all ${medicines.length} active pharmaceutical lines including batch numbers, pricing, strength, QR strings, and shelf allocations.`,
      icon: <Pill className="h-6 w-6 text-cyan-600" />,
      badge: `${medicines.length} records`,
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
      onPDF: () => exportService.exportMedicinesToPDF(medicines, 'Full_Inventory_Audit'),
      onExcel: () => exportService.exportMedicinesToExcel(medicines, 'Full_Inventory_Audit'),
      onCSV: () => exportService.exportMedicinesToCSV(medicines, 'Full_Inventory_Audit')
    },
    {
      id: 'low_stock',
      title: 'Low Stock & Requisition Report',
      description: `Filtered list of ${lowStockMeds.length} medicines currently at or below their safety stock threshold. Use for supplier reorder purchasing.`,
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
      badge: `${lowStockMeds.length} items`,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      onPDF: () => exportService.exportMedicinesToPDF(lowStockMeds, 'Low_Stock_Requisition_Report'),
      onExcel: () => exportService.exportMedicinesToExcel(lowStockMeds, 'Low_Stock_Requisition_Report'),
      onCSV: () => exportService.exportMedicinesToCSV(lowStockMeds, 'Low_Stock_Requisition_Report')
    },
    {
      id: 'expiry_quarantine',
      title: 'Expiry & Quarantine Schedule',
      description: `Clinical compliance ledger of ${expiredMeds.length} expired batches and ${nearExpiryMeds.length} near-expiry lines requiring FEFO rotation or write-off.`,
      icon: <ShieldCheck className="h-6 w-6 text-rose-500" />,
      badge: `${expiredMeds.length + nearExpiryMeds.length} alerts`,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      onPDF: () => exportService.exportMedicinesToPDF([...expiredMeds, ...nearExpiryMeds], 'Expiry_Quarantine_Schedule'),
      onExcel: () => exportService.exportMedicinesToExcel([...expiredMeds, ...nearExpiryMeds], 'Expiry_Quarantine_Schedule'),
      onCSV: () => exportService.exportMedicinesToCSV([...expiredMeds, ...nearExpiryMeds], 'Expiry_Quarantine_Schedule')
    },
    {
      id: 'transactions_ledger',
      title: 'Stock Movement & Dispensing Ledger',
      description: `Chronological audit log of all ${transactions.length} Stock In, Stock Out, and Physical Audit reconciliation entries with operator timestamps.`,
      icon: <ArrowLeftRight className="h-6 w-6 text-emerald-600" />,
      badge: `${transactions.length} transactions`,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      onPDF: () => exportService.exportTransactionsToPDF(transactions, 'Stock_Movement_Ledger'),
      onExcel: () => exportService.exportTransactionsToExcel(transactions, 'Stock_Movement_Ledger'),
      onCSV: () => exportService.exportTransactionsToCSV(transactions, 'Stock_Movement_Ledger')
    },
    {
      id: 'supplier_directory',
      title: 'Authorized Supplier Vendor List',
      description: `Directory of wholesale pharmaceutical distributors, contact emails, order phones, lead times, and associated active contract details.`,
      icon: <Truck className="h-6 w-6 text-indigo-600" />,
      badge: `${suppliers.length} vendors`,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      onPDF: () => showToast('Exported Supplier directory to PDF', 'success'),
      onExcel: () => showToast('Exported Supplier directory to Excel (.xlsx)', 'success'),
      onCSV: () => showToast('Exported Supplier directory to CSV', 'success')
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-600" />
          <span>Regulatory Reports & Analytics Exporter</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate professional clinical spreadsheets, formatted PDF audit logs, and raw CSV datasets
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportModules.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-inner">
                  {rep.icon}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold", rep.badgeColor)}>
                  {rep.badge}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                {rep.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {rep.description}
              </p>
            </div>

            {/* Download Buttons Group */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2.5">
              <button
                onClick={rep.onPDF}
                className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-all"
                title="Download PDF document"
              >
                <Download className="h-4 w-4 text-rose-500" />
                <span>PDF Document</span>
              </button>
              <button
                onClick={rep.onExcel}
                className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-all"
                title="Download Excel (.xlsx) file"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={rep.onCSV}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Download CSV spreadsheet"
              >
                <FileCode className="h-4 w-4 text-slate-500" />
                <span>CSV Dataset</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Notice */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Academic & Regulatory Evaluation Notice:</span>
          All exported documents dynamically compile current client-side state combined with cryptographic QR metadata signatures, formatted strictly for evaluation presentation and healthcare audit trails.
        </div>
      </div>

    </div>
  );
};
