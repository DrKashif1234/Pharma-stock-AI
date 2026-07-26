import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Medicine } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { getExpiryStatus, formatDate } from '../utils/dateUtils';
import { 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Edit2, 
  Trash2, 
  ArrowLeftRight, 
  AlertTriangle, 
  ChevronDown,
  Download
} from 'lucide-react';
import { cn } from '../utils/cn';
import { exportService } from '../services/exportService';

export const InventoryPage: React.FC = () => {
  const { 
    medicines, 
    filters, 
    setFilters, 
    resetFilters,
    openAddMedicineModal, 
    openEditMedicineModal, 
    deleteMedicine,
    openQRScanner,
    setActivePage
  } = useApp();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Categories list for dropdown
  const categories = useMemo(() => {
    const cats = new Set(medicines.map(m => m.category || 'Uncategorized'));
    return ['all', ...Array.from(cats)];
  }, [medicines]);

  // Filter and sort logic
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      // 1. Search text
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchGeneric = m.generic_name.toLowerCase().includes(q);
        const matchBrand = (m.brand || '').toLowerCase().includes(q);
        const matchBatch = m.batch_number.toLowerCase().includes(q);
        if (!matchName && !matchGeneric && !matchBrand && !matchBatch) return false;
      }
      // 2. Category filter
      if (filters.category !== 'all' && m.category !== filters.category) {
        return false;
      }
      // 3. Status filter
      if (filters.status !== 'all') {
        const expStatus = getExpiryStatus(m.expiry_date);
        if (filters.status === 'low_stock' && (m.quantity > (m.min_stock_level || 20) || m.quantity <= 0)) return false;
        if (filters.status === 'out_of_stock' && m.quantity > 0) return false;
        if (filters.status === 'expired' && expStatus !== 'EXPIRED') return false;
        if (filters.status === 'near_expiry' && expStatus !== 'NEAR_30_DAYS' && expStatus !== 'NEAR_60_DAYS' && expStatus !== 'NEAR_90_DAYS') return false;
      }
      return true;
    }).sort((a, b) => {
      let valA: any = a[filters.sortBy as keyof Medicine];
      let valB: any = b[filters.sortBy as keyof Medicine];

      if (filters.sortBy === 'name' || filters.sortBy === 'generic_name' || filters.sortBy === 'category') {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [medicines, filters]);

  const handleDeleteConfirm = async (id: string) => {
    await deleteMedicine(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Actions & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Medicine Inventory Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-cyan-600 dark:text-cyan-400">{filteredMedicines.length}</span> of {medicines.length} pharmaceutical items
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => exportService.exportMedicinesToPDF(filteredMedicines, 'Inventory_Audit_Report')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
            title="Download PDF table"
          >
            <Download className="h-4 w-4 text-rose-500" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={() => exportService.exportMedicinesToExcel(filteredMedicines, 'Pharmacy_Inventory_Audit')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
            title="Download Excel spreadsheet"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={openQRScanner}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
          >
            <QrCode className="h-4 w-4 text-cyan-600" />
            <span>Scan QR</span>
          </button>
          <button
            onClick={openAddMedicineModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand, generic, batch..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
            >
              <option value="all">All Categories ({categories.length - 1})</option>
              {categories.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none font-semibold"
            >
              <option value="all">All Stock Statuses</option>
              <option value="low_stock">🟡 Low Stock Alert (&le; Min threshold)</option>
              <option value="out_of_stock">🔴 Out of Stock (0 units)</option>
              <option value="near_expiry">🟠 Near Expiry (&le; 90 days)</option>
              <option value="expired">🚨 Expired Batch (Quarantine)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By dropdown */}
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="name">Sort: Brand Name</option>
              <option value="generic_name">Sort: Generic Name</option>
              <option value="quantity">Sort: Stock Quantity</option>
              <option value="expiry_date">Sort: Expiry Date</option>
              <option value="selling_price">Sort: Price</option>
            </select>
            <button
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              title="Toggle Ascending/Descending"
            >
              {filters.sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
        </div>

        {/* Active filters pill bar */}
        {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Active Filters:
            </span>
            {filters.search && (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-medium">
                Search: "{filters.search}"
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-medium">
                Category: {filters.category}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                Status: {filters.status.replace('_', ' ').toUpperCase()}
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold ml-2"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      {filteredMedicines.length === 0 ? (
        <EmptyState
          title="No Matching Medicines"
          description="We couldn't find any pharmaceutical items matching your search or filters. Try adjusting your criteria or register a new medicine."
          actionLabel="Register New Medicine"
          onAction={openAddMedicineModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Medicine Info</th>
                  <th className="py-3.5 px-4">Category / Form</th>
                  <th className="py-3.5 px-4">Batch # & Location</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredMedicines.map((med) => {
                  const expStatus = getExpiryStatus(med.expiry_date);
                  const isLowStock = med.quantity <= (med.min_stock_level || 20);
                  const isOut = med.quantity === 0;

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      {/* Name & Generic */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {med.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {med.generic_name} ({med.strength})
                        </div>
                      </td>

                      {/* Category & Form */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                          {med.category}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Form: {med.dosage_form}
                        </div>
                      </td>

                      {/* Batch & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {med.batch_number}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {med.storage_location}
                        </div>
                      </td>

                      {/* Stock Qty */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                        <div className={cn(
                          "text-sm font-extrabold",
                          isOut ? "text-rose-600 dark:text-rose-400" : (isLowStock ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")
                        )}>
                          {formatNumber(med.quantity)} units
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Min: {med.min_stock_level}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(med.selling_price)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: {formatCurrency(med.purchase_price)}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={cn(
                          "font-semibold",
                          expStatus === 'EXPIRED' ? "text-rose-600 dark:text-rose-400 font-bold" : (expStatus !== 'HEALTHY' ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300")
                        )}>
                          {formatDate(med.expiry_date)}
                        </div>
                      </td>

                      {/* Expiry / Stock Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {expStatus === 'EXPIRED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse">
                            EXPIRED
                          </span>
                        ) : isOut ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            LOW STOCK
                          </span>
                        ) : expStatus !== 'HEALTHY' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
                            {expStatus === 'NEAR_30_DAYS' ? '< 30d Expiry' : (expStatus === 'NEAR_60_DAYS' ? '< 60d Expiry' : '< 90d Expiry')}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            HEALTHY
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Log Stock Button */}
                          <button
                            onClick={() => setActivePage('stock')}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            title="Log Stock In/Out"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditMedicineModal(med)}
                            className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-600 dark:text-cyan-400"
                            title="Edit medicine details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          {confirmDeleteId === med.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDeleteConfirm(med.id)}
                                className="px-2 py-1 rounded bg-rose-600 text-white font-bold text-[10px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px]"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(med.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
