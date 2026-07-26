import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Supplier } from '../types';
import { Truck, Plus, Mail, Phone, MapPin, Globe, Clock, ShieldCheck, Star, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, medicines, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSup, setNewSup] = useState<Partial<Supplier>>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    lead_time_days: 3,
    status: 'ACTIVE',
    rating: 5,
    notes: 'Approved primary wholesale vendor'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name?.trim()) return;
    await addSupplier(newSup);
    setIsModalOpen(false);
    setNewSup({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      lead_time_days: 3,
      status: 'ACTIVE',
      rating: 5,
      notes: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-cyan-600" />
            <span>Authorized Pharmaceutical Supplier Directory</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage wholesale distributor contracts, order contact channels, and typical logistics lead times
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>+ Register New Supplier</span>
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((sup) => {
          const suppliedCount = medicines.filter(m => m.supplier === sup.name || (m.supplier && m.supplier.includes(sup.name))).length;

          return (
            <div
              key={sup.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase",
                    sup.status === 'ACTIVE' 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}>
                    ● {sup.status} VENDOR
                  </span>
                  <div className="flex items-center text-amber-500 font-bold text-xs">
                    <Star className="h-3.5 w-3.5 fill-current mr-1" />
                    <span>{sup.rating || 5}.0 / 5.0</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
                  {sup.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Contact: <strong className="text-slate-700 dark:text-slate-300">{sup.contact_person || 'Sales Dept'}</strong>
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate font-mono">{sup.email || 'orders@supplier.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-mono">{sup.phone || '+1 (800) 555-0199'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-[11px]">{sup.address || 'Logistics Distribution Hub, USA'}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 font-semibold text-cyan-600 dark:text-cyan-400">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Avg Lead Time: {sup.lead_time_days || 3} Business Days</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {suppliedCount} Active Medicines
                </span>
                <button
                  onClick={() => showToast(`Initiated requisition inquiry email to ${sup.name}`, 'info')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 font-bold text-xs transition-all"
                >
                  Request Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-600/10 to-emerald-600/10">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Register New Pharmaceutical Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Wholesale Vendor Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roche Pharmaceuticals Distribution"
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Michael Scott"
                    value={newSup.contact_person}
                    onChange={(e) => setNewSup({ ...newSup, contact_person: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newSup.lead_time_days}
                    onChange={(e) => setNewSup({ ...newSup, lead_time_days: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Order Email</label>
                  <input
                    type="email"
                    placeholder="orders@roche.com"
                    value={newSup.email}
                    onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (800) 222-3344"
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Address / Logistics Depot</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Pharma Parkway, Chicago, IL"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Register Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
