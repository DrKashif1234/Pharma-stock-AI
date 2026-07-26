import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QrCode, X, Camera, Keyboard, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';
import { Medicine } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { getExpiryStatus, formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, closeQRScanner, showToast, openEditMedicineModal, setActivePage } = useApp();
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'simulated'>('simulated');
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedMedicine, setScannedMedicine] = useState<Medicine | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLookup, setLoadingLookup] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-reader-box";

  useEffect(() => {
    if (!isQRScannerOpen) {
      stopCamera();
      setScannedMedicine(null);
      setErrorMsg(null);
      setManualInput('');
    }
  }, [isQRScannerOpen]);

  const stopCamera = () => {
    if (scannerRef.current && scanning) {
      scannerRef.current.stop().catch(console.error);
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setScannedMedicine(null);
    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;
      setScanning(true);
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          handleLookup(decodedText);
        },
        () => {
          // ignore frame scan failures
        }
      );
    } catch (err: any) {
      console.error("Camera start error:", err);
      setErrorMsg("Camera access denied or unavailable in sandbox iframe. Please use Simulated Scan or Manual Barcode Entry below.");
      setScanning(false);
      setScanMode('simulated');
    }
  };

  const handleLookup = async (qrDataStr: string) => {
    if (!qrDataStr.trim()) return;
    setLoadingLookup(true);
    setErrorMsg(null);
    try {
      const found = await api.scanQRCode(qrDataStr);
      setScannedMedicine(found);
      showToast(`Verified medicine: ${found.name}`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || "No matching medicine found for barcode.");
      setScannedMedicine(null);
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSimulatedScan = (sampleBatch: string) => {
    setManualInput(sampleBatch);
    handleLookup(sampleBatch);
  };

  if (!isQRScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-600/10 to-emerald-600/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-md">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">QR Code & Barcode Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan packaging labels or simulate instant barcode lookups</p>
            </div>
          </div>
          <button
            onClick={closeQRScanner}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950/50">
          <button
            onClick={() => { stopCamera(); setScanMode('simulated'); }}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all",
              scanMode === 'simulated' ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <QrCode className="h-4 w-4" />
            <span>Simulated Scan</span>
          </button>
          <button
            onClick={() => { setScanMode('camera'); startCamera(); }}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all",
              scanMode === 'camera' ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={() => { stopCamera(); setScanMode('manual'); }}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all",
              scanMode === 'manual' ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Keyboard className="h-4 w-4" />
            <span>Manual Barcode</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {/* CAMERA MODE */}
          {scanMode === 'camera' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div id={readerElementId} className="w-full max-w-sm h-64 rounded-2xl overflow-hidden border-2 border-dashed border-cyan-500/50 bg-black/5 flex items-center justify-center relative">
                {!scanning && (
                  <div className="text-center p-6 text-slate-500 text-sm">
                    <Camera className="h-10 w-10 mx-auto mb-2 text-slate-400 animate-pulse" />
                    <span>Initializing camera viewfinder...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-slate-500">
                Point your device camera at the medicine QR packaging label.
              </p>
            </div>
          )}

          {/* SIMULATED SCAN MODE */}
          {scanMode === 'simulated' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Click any pre-generated barcode below to simulate instantaneous optical QR scanning of active inventory:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleSimulatedScan('AMO-8912-A')}
                  className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-xs text-rose-800 dark:text-rose-300 block">Amoxil 500mg</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">Batch: AMO-8912-A (EXPIRED)</span>
                  </div>
                  <QrCode className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleSimulatedScan('AZI-1102-Z')}
                  className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-xs text-amber-800 dark:text-amber-300 block">Zithromax 250mg</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Batch: AZI-1102-Z (OUT OF STOCK)</span>
                  </div>
                  <QrCode className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleSimulatedScan('LIS-4421-B')}
                  className="p-3 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/60 dark:hover:bg-orange-900/40 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-xs text-orange-800 dark:text-orange-300 block">Lisinopril 10mg</span>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono">Batch: LIS-4421-B (&lt;30d Expiry)</span>
                  </div>
                  <QrCode className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => handleSimulatedScan('PAN-2024-T')}
                  className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-xs text-emerald-800 dark:text-emerald-300 block">Panadol Extra</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Batch: PAN-2024-T (Healthy)</span>
                  </div>
                  <QrCode className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* MANUAL MODE */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter Batch Number, Medicine ID, or QR JSON String:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. MET-7731-C or Amoxil..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup(manualInput)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={() => handleLookup(manualInput)}
                  disabled={!manualInput.trim() || loadingLookup}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-1.5 transition-all"
                >
                  {loadingLookup ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  <span>Verify</span>
                </button>
              </div>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs">
              <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Verification Notice:</span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* SCANNED MEDICINE RESULT CARD */}
          {scannedMedicine && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/50 dark:from-slate-800 dark:to-cyan-950/30 border border-cyan-200 dark:border-cyan-800/80 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-base">{scannedMedicine.name}</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {scannedMedicine.batch_number}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <span className="text-slate-400 block">Category & Strength:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{scannedMedicine.category} — {scannedMedicine.strength}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Stock:</span>
                  <span className={cn(
                    "font-bold",
                    scannedMedicine.quantity === 0 ? "text-rose-600 dark:text-rose-400" : (scannedMedicine.quantity <= scannedMedicine.min_stock_level ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")
                  )}>
                    {formatNumber(scannedMedicine.quantity)} units
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Expiry Date:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{formatDate(scannedMedicine.expiry_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Storage Location:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{scannedMedicine.storage_location}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                <button
                  onClick={() => {
                    closeQRScanner();
                    openEditMedicineModal(scannedMedicine);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs text-center transition-all shadow-sm"
                >
                  Edit / Update Stock
                </button>
                <button
                  onClick={() => {
                    closeQRScanner();
                    setActivePage('stock');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs text-center transition-all shadow-sm"
                >
                  Log Transaction
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={closeQRScanner}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
