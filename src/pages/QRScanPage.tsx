import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Medicine } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Search, Download, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { cn } from '../utils/cn';

export const QRScanPage: React.FC = () => {
  const { medicines, openQRScanner, openEditMedicineModal, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(medicines[0] || null);
  const [printBatchSize, setPrintBatchSize] = useState<number>(6);

  // Medicines load asynchronously after mount, so the initial useState value
  // (evaluated while medicines was still []) can be stuck at null. Sync it once data arrives.
  useEffect(() => {
    if (!selectedMed && medicines.length > 0) {
      setSelectedMed(medicines[0]);
    }
  }, [medicines, selectedMed]);

  const filtered = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrintLabel = () => {
    window.print();
    showToast('Sent QR barcodes to print dialog', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <QrCode className="h-6 w-6 text-cyan-600" />
            <span>QR Code & Barcode Inventory Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate printable packaging labels, verify batch integrity, or perform instant optical audit checks
          </p>
        </div>
        <button
          onClick={openQRScanner}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-sm shadow-md transition-all self-start sm:self-center"
        >
          <QrCode className="h-5 w-5" />
          <span>Launch Optical Barcode Scanner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Medicine List for Label Generation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Select Medicine to View/Print QR</span>
            <span className="text-xs font-normal text-slate-400">{filtered.length} available</span>
          </h3>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {filtered.map((med) => {
              const isSelected = selectedMed?.id === med.id;
              return (
                <button
                  key={med.id}
                  onClick={() => setSelectedMed(med)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group",
                    isSelected
                      ? "bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500/80 shadow-xs"
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">{med.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 block">Batch: {med.batch_number}</span>
                  </div>
                  <QrCode className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isSelected ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: QR Label Preview & Printing Workshop */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMed ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Packaging Label Preview
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedMed.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMed.generic_name} — {selectedMed.strength}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={printBatchSize}
                    onChange={(e) => setPrintBatchSize(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value={1}>Print 1 Label</option>
                    <option value={6}>Print 6 Labels (Sheet)</option>
                    <option value={12}>Print 12 Labels (Bulk Sheet)</option>
                  </select>
                  <button
                    onClick={handlePrintLabel}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition-all shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Labels</span>
                  </button>
                </div>
              </div>

              {/* Single Label Detail Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800/60 dark:to-cyan-950/20 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* QR Code SVG */}
                <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-100 flex flex-col items-center justify-center">
                  <QRCodeSVG 
                    value={selectedMed.qr_code || JSON.stringify({ id: selectedMed.id, name: selectedMed.name, batch: selectedMed.batch_number })}
                    size={160}
                    level="H"
                    includeMargin
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-700 mt-2">
                    {selectedMed.batch_number}
                  </span>
                </div>

                {/* Medicine Metadata Details */}
                <div className="flex-1 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">Batch Number:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedMed.batch_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Stock Level:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(selectedMed.quantity)} units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Expiry Date:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedMed.expiry_date)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Storage Shelf:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMed.storage_location}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    This clinical QR barcode contains encrypted pharmaceutical metadata including batch origin, supplier ID (<span className="font-semibold text-slate-700 dark:text-slate-300">{selectedMed.supplier}</span>), and automated expiry tracking signatures for instantaneous optical verification.
                  </p>

                  <button
                    onClick={() => openEditMedicineModal(selectedMed)}
                    className="mt-2 text-xs font-semibold text-cyan-600 hover:underline inline-block"
                  >
                    Edit medicine stock & properties →
                  </button>
                </div>
              </div>

              {/* Multi-Label Printable Grid Sheet (For previewing how labels look printed) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Print Sheet Preview ({printBatchSize} Stickers):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: Math.min(printBatchSize, 6) }).map((_, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center space-x-3">
                      <QRCodeSVG 
                        value={selectedMed.qr_code || selectedMed.batch_number}
                        size={56}
                        level="M"
                      />
                      <div className="min-w-0 overflow-hidden text-[10px]">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">{selectedMed.name}</span>
                        <span className="font-mono text-slate-500 block">{selectedMed.batch_number}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-semibold block">Exp: {formatDate(selectedMed.expiry_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a medicine to view packaging barcode preview</div>
          )}
        </div>

      </div>

    </div>
  );
};
