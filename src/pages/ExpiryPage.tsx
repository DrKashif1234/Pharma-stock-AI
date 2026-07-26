import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { getExpiryStatus, formatDate } from '../utils/dateUtils';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { AlertTriangle, AlertOctagon, Clock, ShieldAlert, CheckCircle2, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

export const ExpiryPage: React.FC = () => {
  const { medicines, recordTransaction, openEditMedicineModal, openAIAssistantWithQuery, showToast } = useApp();

  const expiryGroups = useMemo(() => {
    const expired: typeof medicines = [];
    const near30: typeof medicines = [];
    const near60: typeof medicines = [];
    const near90: typeof medicines = [];
    const healthy: typeof medicines = [];

    medicines.forEach(m => {
      const status = getExpiryStatus(m.expiry_date);
      if (status === 'EXPIRED') expired.push(m);
      else if (status === 'NEAR_30_DAYS') near30.push(m);
      else if (status === 'NEAR_60_DAYS') near60.push(m);
      else if (status === 'NEAR_90_DAYS') near90.push(m);
      else healthy.push(m);
    });

    return { expired, near30, near60, near90, healthy };
  }, [medicines]);

  const handleQuarantineDispose = async (medId: string, medName: string, qty: number) => {
    if (qty <= 0) {
      showToast(`${medName} is already at 0 quantity.`, 'info');
      return;
    }
    await recordTransaction({
      medicine_id: medId,
      transaction_type: 'STOCK_OUT',
      quantity: qty,
      reason: 'Expired stock quarantine write-off',
      notes: 'Automated 1-click clinical disposal via Expiry Center',
      operator: 'Pharmacist Safety Protocol'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span>Automated Expiry & Quarantine Monitoring</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            FEFO (First-Expired, First-Out) tracking with 30, 60, and 90-day clinical safety alerts
          </p>
        </div>
        <button
          onClick={() => openAIAssistantWithQuery("Analyze our expired and near-expiry stock and recommend a quarantine and rotation plan.")}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-center"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Expiry Risk Analysis</span>
        </button>
      </div>

      {/* 1. EXPIRED MEDICINES QUARANTINE SECTION (CRITICAL) */}
      <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-sm">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                🚨 Expired Batches — Immediate Quarantine Required ({expiryGroups.expired.length})
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Do not dispense! These items must be segregated and written off according to healthcare regulations.
              </p>
            </div>
          </div>
        </div>

        {expiryGroups.expired.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 text-center text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>Excellent safety record! 0 expired medicines currently in pharmacy inventory.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiryGroups.expired.map(med => (
              <div key={med.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-sm flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{med.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      EXPIRED
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block">{med.generic_name} ({med.strength})</span>
                  <div className="mt-2 text-xs grid grid-cols-2 gap-1 font-mono text-slate-600 dark:text-slate-300">
                    <div>Batch: {med.batch_number}</div>
                    <div>Qty: <strong className="text-rose-600">{med.quantity} units</strong></div>
                    <div className="col-span-2 text-rose-600 font-bold">Exp: {formatDate(med.expiry_date)}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => openEditMedicineModal(med)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Edit Record
                  </button>
                  <button
                    onClick={() => handleQuarantineDispose(med.id, med.name, med.quantity)}
                    disabled={med.quantity === 0}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Dispose ({med.quantity})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. NEAR EXPIRY BREAKDOWN (30, 60, 90 Days) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* < 30 Days (Orange Alert) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-orange-200 dark:border-orange-900/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-orange-100 dark:border-orange-900/30">
            <h4 className="font-bold text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Expiring Within 30 Days</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold text-xs">
              {expiryGroups.near30.length} items
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {expiryGroups.near30.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No items expiring in the next 30 days.</p>
            ) : (
              expiryGroups.near30.map(med => (
                <div key={med.id} className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{med.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">Batch: {med.batch_number} — {med.quantity} units</span>
                    <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300 block mt-0.5">Exp: {formatDate(med.expiry_date)}</span>
                  </div>
                  <button
                    onClick={() => openEditMedicineModal(med)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-orange-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* < 60 Days (Yellow Alert) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-900/30">
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Expiring Within 60 Days</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
              {expiryGroups.near60.length} items
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {expiryGroups.near60.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No items expiring between 31–60 days.</p>
            ) : (
              expiryGroups.near60.map(med => (
                <div key={med.id} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{med.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">Batch: {med.batch_number} — {med.quantity} units</span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block mt-0.5">Exp: {formatDate(med.expiry_date)}</span>
                  </div>
                  <button
                    onClick={() => openEditMedicineModal(med)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-amber-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* < 90 Days (Yellow-Green Alert) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-yellow-200 dark:border-yellow-900/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-yellow-100 dark:border-yellow-900/30">
            <h4 className="font-bold text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Expiring Within 90 Days</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 font-bold text-xs">
              {expiryGroups.near90.length} items
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {expiryGroups.near90.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No items expiring between 61–90 days.</p>
            ) : (
              expiryGroups.near90.map(med => (
                <div key={med.id} className="p-3.5 rounded-2xl bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-800/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{med.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">Batch: {med.batch_number} — {med.quantity} units</span>
                    <span className="text-[11px] font-bold text-yellow-700 dark:text-yellow-300 block mt-0.5">Exp: {formatDate(med.expiry_date)}</span>
                  </div>
                  <button
                    onClick={() => openEditMedicineModal(med)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs hover:bg-yellow-100"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. HEALTHY STOCK SUMMARY CARD */}
      <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
              Optimal & Healthy Inventory ({expiryGroups.healthy.length} Medicines)
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              These pharmaceutical batches have greater than 90 days of clinical shelf-life remaining.
            </p>
          </div>
        </div>
        <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-extrabold text-sm">
          {((expiryGroups.healthy.length / (medicines.length || 1)) * 100).toFixed(1)}% Healthy Ratio
        </span>
      </div>

    </div>
  );
};
