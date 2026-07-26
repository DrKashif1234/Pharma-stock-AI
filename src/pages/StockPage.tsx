import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { ArrowLeftRight, ArrowDownRight, ArrowUpRight, Plus, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { cn } from '../utils/cn';

export const StockPage: React.FC = () => {
  const { medicines, transactions, recordTransaction, loading } = useApp();
  
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || '');
  const [txType, setTxType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('STOCK_IN');
  const [quantity, setQuantity] = useState<number>(50);
  const [reason, setReason] = useState<string>('Wholesale purchase / replenishment');
  const [notes, setNotes] = useState<string>('');
  const [operator, setOperator] = useState<string>('Dr. Sarah Jenkins (Lead Pharmacist)');
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const selectedMedicine = medicines.find(m => m.id === selectedMedId) || medicines[0];

  // Medicines load asynchronously after mount, so the initial useState value
  // (evaluated while medicines was still []) can be stuck at ''. Sync it once data arrives.
  useEffect(() => {
    if (!selectedMedId && medicines.length > 0) {
      setSelectedMedId(medicines[0].id);
    }
  }, [medicines, selectedMedId]);

  const handleTxTypeChange = (type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT') => {
    setTxType(type);
    if (type === 'STOCK_IN') setReason('Wholesale purchase / replenishment');
    if (type === 'STOCK_OUT') setReason('Prescription dispensing to patient');
    if (type === 'ADJUSTMENT') setReason('Inventory physical audit reconciliation');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || quantity <= 0) return;
    setSubmitting(true);
    try {
      await recordTransaction({
        medicine_id: selectedMedId,
        transaction_type: txType,
        quantity: Number(quantity),
        reason,
        notes: notes.trim() || undefined,
        operator: operator.trim() || 'Pharmacist'
      });
      setQuantity(20);
      setNotes('');
    } catch {
      // handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.transaction_type === filterType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6 text-cyan-600" />
          <span>Stock Management & Dispensing Log</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Record stock replenishment, prescription dispensing, returns, and audit reconciliations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Log Transaction Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5 h-fit">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Stock Transaction</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              Instant Sync
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Transaction Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Type*
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTxTypeChange('STOCK_IN')}
                  className={cn(
                    "py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all",
                    txType === 'STOCK_IN'
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Stock In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTxTypeChange('STOCK_OUT')}
                  className={cn(
                    "py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all",
                    txType === 'STOCK_OUT'
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Stock Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTxTypeChange('ADJUSTMENT')}
                  className={cn(
                    "py-2.5 px-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all",
                    txType === 'ADJUSTMENT'
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Adjust</span>
                </button>
              </div>
            </div>

            {/* 2. Medicine Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Pharmaceutical Item*
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {medicines.map(med => (
                  <option key={med.id} value={med.id}>
                    {med.name} — Batch: {med.batch_number} ({med.quantity} units left)
                  </option>
                ))}
              </select>
              {selectedMedicine && (
                <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Current Stock: <strong className="text-slate-700 dark:text-slate-200">{formatNumber(selectedMedicine.quantity)} units</strong></span>
                  <span>Price: {formatCurrency(selectedMedicine.selling_price)}</span>
                </p>
              )}
            </div>

            {/* 3. Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Units*
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* 4. Reason Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reason*
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {txType === 'STOCK_IN' && (
                  <>
                    <option value="Wholesale purchase / replenishment">Wholesale purchase / replenishment</option>
                    <option value="Customer return / restock">Customer return / restock</option>
                    <option value="Emergency clinical transfer in">Emergency clinical transfer in</option>
                  </>
                )}
                {txType === 'STOCK_OUT' && (
                  <>
                    <option value="Prescription dispensing to patient">Prescription dispensing to patient</option>
                    <option value="Hospital ward requisition">Hospital ward requisition</option>
                    <option value="Damaged / contaminated stock disposal">Damaged / contaminated stock disposal</option>
                    <option value="Expired stock quarantine write-off">Expired stock quarantine write-off</option>
                  </>
                )}
                {txType === 'ADJUSTMENT' && (
                  <>
                    <option value="Inventory physical audit reconciliation">Inventory physical audit reconciliation</option>
                    <option value="System migration correction">System migration correction</option>
                  </>
                )}
              </select>
            </div>

            {/* 5. Operator & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Operator
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Clinical Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Verified packaging seal. Invoice #INV-9821"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !selectedMedId}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center space-x-2",
                txType === 'STOCK_IN' ? "bg-emerald-600 hover:bg-emerald-700" : (txType === 'STOCK_OUT' ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700")
              )}
            >
              {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>Confirm & Log {txType.replace('_', ' ')}</span>
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Transaction Log Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Audit Log History</h3>
              <p className="text-xs text-slate-500">Real-time chronological record of stock adjustments</p>
            </div>
            
            {/* Filter pills */}
            <div className="flex gap-1.5 self-start sm:self-center">
              {['ALL', 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold transition-all",
                    filterType === t
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">No transaction records match this filter type.</div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Medicine Info</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Reason / Notes</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{tx.medicine_name}</span>
                        <span className="text-[10px] font-mono text-slate-400">Batch: {tx.batch_number || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full font-bold text-[10px]",
                          tx.transaction_type === 'STOCK_IN' 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300" 
                            : (tx.transaction_type === 'STOCK_OUT' 
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300" 
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300")
                        )}>
                          {tx.transaction_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="text-slate-700 dark:text-slate-300 font-medium truncate">{tx.reason}</div>
                        {tx.notes && <div className="text-[10px] text-slate-400 truncate">{tx.notes}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono font-extrabold text-right whitespace-nowrap">
                        <span className={tx.transaction_type === 'STOCK_IN' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          {tx.transaction_type === 'STOCK_IN' ? `+${tx.quantity}` : `-${tx.quantity}`} units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {tx.operator || 'Pharmacist'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
