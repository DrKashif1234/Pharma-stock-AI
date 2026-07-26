import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Medicine, DosageForm, MedicineCategory } from '../../types';
import { X, Plus, Save, RefreshCw, AlertCircle, QrCode } from 'lucide-react';
import { generateBatchNumber, generateQRString } from '../../utils/formatters';
import { formatDateForInput } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

const DOSAGE_FORMS: DosageForm[] = [
  'Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Ointment', 'Drops', 'Suspension', 'Cream', 'Vial'
];

const CATEGORIES: MedicineCategory[] = [
  'Antibiotics', 'Cardiovascular', 'Analgesics', 'Antidiabetic', 'Respiratory', 'Gastrointestinal', 'Antihistamines', 'Vitamins & Supplements', 'Dermatological', 'Emergency Medicine'
];

export const MedicineModal: React.FC = () => {
  const { isMedicineModalOpen, selectedMedicineForEdit, closeMedicineModal, addMedicine, updateMedicine, suppliers } = useApp();
  const isEditing = !!selectedMedicineForEdit;

  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    generic_name: '',
    brand: '',
    category: 'Antibiotics',
    dosage_form: 'Tablet',
    strength: '',
    batch_number: '',
    supplier: '',
    quantity: 100,
    min_stock_level: 25,
    purchase_price: 5.00,
    selling_price: 10.00,
    manufacturing_date: formatDateForInput(new Date(Date.now() - 365 * 86400000)),
    expiry_date: formatDateForInput(new Date(Date.now() + 365 * 86400000)),
    storage_location: 'Shelf A-01',
    qr_code: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isMedicineModalOpen) {
      setErrorMsg(null);
      if (selectedMedicineForEdit) {
        setFormData({
          ...selectedMedicineForEdit,
          manufacturing_date: formatDateForInput(selectedMedicineForEdit.manufacturing_date),
          expiry_date: formatDateForInput(selectedMedicineForEdit.expiry_date)
        });
      } else {
        const cat = 'Antibiotics';
        const batch = generateBatchNumber(cat);
        setFormData({
          name: '',
          generic_name: '',
          brand: '',
          category: cat,
          dosage_form: 'Tablet',
          strength: '500mg',
          batch_number: batch,
          supplier: suppliers[0]?.name || 'Pfizer Global Supply',
          quantity: 100,
          min_stock_level: 25,
          purchase_price: 5.00,
          selling_price: 10.00,
          manufacturing_date: formatDateForInput(new Date(Date.now() - 180 * 86400000)),
          expiry_date: formatDateForInput(new Date(Date.now() + 365 * 86400000)),
          storage_location: 'Shelf A-01 (Controlled Temp)',
          notes: ''
        });
      }
    }
  }, [isMedicineModalOpen, selectedMedicineForEdit, suppliers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const next = { ...prev };
      if (type === 'number') {
        (next as any)[name] = value === '' ? 0 : parseFloat(value);
      } else {
        (next as any)[name] = value;
      }
      return next;
    });
  };

  const handleGenerateNewBatch = () => {
    const nextBatch = generateBatchNumber(formData.category || 'GEN');
    setFormData(prev => ({ ...prev, batch_number: nextBatch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name?.trim() || !formData.generic_name?.trim() || !formData.batch_number?.trim()) {
      setErrorMsg('Please fill out all required fields (Name, Generic Name, Batch Number).');
      return;
    }

    if (new Date(formData.expiry_date || '') < new Date(formData.manufacturing_date || '')) {
      setErrorMsg('Expiry date cannot be prior to manufacturing date.');
      return;
    }

    setSaving(true);
    try {
      const qrStr = generateQRString({
        id: selectedMedicineForEdit?.id,
        name: formData.name!,
        batch_number: formData.batch_number!,
        expiry_date: formData.expiry_date!
      });

      const payload: Partial<Medicine> = {
        ...formData,
        qr_code: qrStr
      };

      if (isEditing && selectedMedicineForEdit) {
        await updateMedicine(selectedMedicineForEdit.id, payload);
      } else {
        await addMedicine(payload);
      }
      closeMedicineModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save medicine record.');
    } finally {
      setSaving(false);
    }
  };

  if (!isMedicineModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-600/10 to-emerald-600/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-md">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? `Edit Medicine: ${selectedMedicineForEdit?.name}` : 'Register New Pharmaceutical Stock'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? 'Modify clinical details, pricing, and storage allocation' : 'Enter complete medicine metadata to assign unique QR barcode'}
              </p>
            </div>
          </div>
          <button
            onClick={closeMedicineModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Clinical Identification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">1. Clinical Identification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Name (Brand / Common)*
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Amoxil 500mg or Zestril"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Generic Name (Active Ingredient)*
                </label>
                <input
                  type="text"
                  name="generic_name"
                  required
                  placeholder="e.g. Amoxicillin Trihydrate"
                  value={formData.generic_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturer / Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Pfizer / GSK / Novartis"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dosage Form
                </label>
                <select
                  name="dosage_form"
                  value={formData.dosage_form}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {DOSAGE_FORMS.map(df => <option key={df} value={df}>{df}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Strength / Concentration
                </label>
                <input
                  type="text"
                  name="strength"
                  placeholder="e.g. 500mg, 10mg, 100IU/ml"
                  value={formData.strength}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Inventory & Supplier */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">2. Inventory & Logistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Number*
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    name="batch_number"
                    required
                    value={formData.batch_number}
                    onChange={handleChange}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateNewBatch}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                    title="Generate Random Batch #"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Stock Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Min Safety Stock Level
                </label>
                <input
                  type="number"
                  name="min_stock_level"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Pfizer Global Supply">Pfizer Global Supply</option>
                  <option value="Novartis Pharmaceuticals">Novartis Pharmaceuticals</option>
                  <option value="GlaxoSmithKline (GSK) Pharma">GlaxoSmithKline (GSK) Pharma</option>
                  <option value="Abbott Healthcare Supply">Abbott Healthcare Supply</option>
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Price ($ / Unit)
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  step="0.01"
                  min="0"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selling Price ($ / Unit)
                </label>
                <input
                  type="number"
                  name="selling_price"
                  step="0.01"
                  min="0"
                  value={formData.selling_price}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Expiry & Storage Allocation */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">3. Expiry Monitoring & Storage</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturing Date*
                </label>
                <input
                  type="date"
                  name="manufacturing_date"
                  required
                  value={formData.manufacturing_date}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expiry Date*
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  required
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage Allocation & Shelf
                </label>
                <input
                  type="text"
                  name="storage_location"
                  placeholder="e.g. Shelf A-01, Refrigerator R-02"
                  value={formData.storage_location}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Warnings & Handling Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="e.g. Must be kept refrigerated. Take with food."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeMedicineModal}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md flex items-center space-x-2 transition-all"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditing ? 'Update Stock Record' : 'Save & Generate QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
