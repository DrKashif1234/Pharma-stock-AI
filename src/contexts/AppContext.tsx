import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Medicine, InventoryTransaction, Supplier, Report, AIChatMessage, DashboardMetrics, FilterOptions } from '../types';
import { api } from '../services/api';

export type PageView = 'dashboard' | 'inventory' | 'qr' | 'stock' | 'expiry' | 'ai' | 'reports' | 'suppliers';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Data
  medicines: Medicine[];
  transactions: InventoryTransaction[];
  suppliers: Supplier[];
  reports: Report[];
  chatHistory: AIChatMessage[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // CRUD & Operations
  addMedicine: (data: Partial<Medicine>) => Promise<Medicine>;
  updateMedicine: (id: string, data: Partial<Medicine>) => Promise<Medicine>;
  deleteMedicine: (id: string) => Promise<void>;
  recordTransaction: (data: {
    medicine_id: string;
    transaction_type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    reason: string;
    quantity: number;
    notes?: string;
    operator?: string;
  }) => Promise<void>;
  addSupplier: (data: Partial<Supplier>) => Promise<Supplier>;
  createReportRecord: (data: Partial<Report>) => Promise<Report>;
  sendAIQuery: (query: string) => Promise<AIChatMessage>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Modals & Drawers
  isQRScannerOpen: boolean;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  isMedicineModalOpen: boolean;
  selectedMedicineForEdit: Medicine | null;
  openAddMedicineModal: () => void;
  openEditMedicineModal: (med: Medicine) => void;
  closeMedicineModal: () => void;
  isAIAssistantOpen: boolean;
  toggleAIAssistant: () => void;
  openAIAssistantWithQuery: (initialPrompt?: string) => void;

  // Global search & filter
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
}

const defaultFilters: FilterOptions = {
  search: '',
  category: 'all',
  status: 'all',
  supplier: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageView>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modals
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState<boolean>(false);
  const [selectedMedicineForEdit, setSelectedMedicineForEdit] = useState<Medicine | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [medsData, txData, supData, repData, aiData, metricsData] = await Promise.all([
        api.getMedicines(),
        api.getTransactions(),
        api.getSuppliers(),
        api.getReports(),
        api.getChatHistory(),
        api.getAnalytics()
      ]);
      setMedicines(medsData);
      setTransactions(txData);
      setSuppliers(supData);
      setReports(repData);
      setChatHistory(aiData);
      setMetrics(metricsData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setError(err.message || 'Failed to sync with backend server.');
      showToast('Error syncing inventory data from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Operations
  const addMedicine = async (data: Partial<Medicine>): Promise<Medicine> => {
    try {
      const newMed = await api.addMedicine(data);
      showToast(`Added ${newMed.name} to pharmacy inventory!`, 'success');
      await refreshData();
      return newMed;
    } catch (err: any) {
      showToast(err.message || 'Failed to add medicine', 'error');
      throw err;
    }
  };

  const updateMedicine = async (id: string, data: Partial<Medicine>): Promise<Medicine> => {
    try {
      const updated = await api.updateMedicine(id, data);
      showToast(`Updated ${updated.name} successfully!`, 'success');
      await refreshData();
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Failed to update medicine', 'error');
      throw err;
    }
  };

  const deleteMedicine = async (id: string): Promise<void> => {
    try {
      await api.deleteMedicine(id);
      showToast('Medicine removed from inventory.', 'info');
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete medicine', 'error');
      throw err;
    }
  };

  const recordTransaction = async (data: {
    medicine_id: string;
    transaction_type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
    reason: string;
    quantity: number;
    notes?: string;
    operator?: string;
  }): Promise<void> => {
    try {
      const result = await api.recordTransaction(data);
      showToast(
        `Recorded ${data.transaction_type.replace('_', ' ')} (${data.quantity} units) for ${result.updatedMedicine.name}`,
        'success'
      );
      await refreshData();
    } catch (err: any) {
      showToast(err.message || 'Stock transaction failed', 'error');
      throw err;
    }
  };

  const addSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
    try {
      const newSup = await api.addSupplier(data);
      showToast(`Registered supplier: ${newSup.name}`, 'success');
      await refreshData();
      return newSup;
    } catch (err: any) {
      showToast(err.message || 'Failed to add supplier', 'error');
      throw err;
    }
  };

  const createReportRecord = async (data: Partial<Report>): Promise<Report> => {
    try {
      const newRep = await api.createReport(data);
      showToast(`Generated report: ${newRep.title}`, 'success');
      await refreshData();
      return newRep;
    } catch (err: any) {
      showToast(err.message || 'Failed to create report record', 'error');
      throw err;
    }
  };

  const sendAIQuery = async (query: string): Promise<AIChatMessage> => {
    try {
      const resMsg = await api.sendAIChatQuery(query);
      await refreshData();
      return resMsg;
    } catch (err: any) {
      showToast(err.message || 'AI query failed', 'error');
      throw err;
    }
  };

  const openQRScanner = useCallback(() => setIsQRScannerOpen(true), []);
  const closeQRScanner = useCallback(() => setIsQRScannerOpen(false), []);

  const openAddMedicineModal = useCallback(() => {
    setSelectedMedicineForEdit(null);
    setIsMedicineModalOpen(true);
  }, []);

  const openEditMedicineModal = useCallback((med: Medicine) => {
    setSelectedMedicineForEdit(med);
    setIsMedicineModalOpen(true);
  }, []);

  const closeMedicineModal = useCallback(() => {
    setSelectedMedicineForEdit(null);
    setIsMedicineModalOpen(false);
  }, []);

  const toggleAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(prev => !prev);
  }, []);

  const openAIAssistantWithQuery = useCallback((initialPrompt?: string) => {
    setIsAIAssistantOpen(true);
    if (initialPrompt) {
      sendAIQuery(initialPrompt);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        isDarkMode,
        toggleDarkMode,
        medicines,
        transactions,
        suppliers,
        reports,
        chatHistory,
        metrics,
        loading,
        error,
        refreshData,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        recordTransaction,
        addSupplier,
        createReportRecord,
        sendAIQuery,
        toasts,
        showToast,
        removeToast,
        isQRScannerOpen,
        openQRScanner,
        closeQRScanner,
        isMedicineModalOpen,
        selectedMedicineForEdit,
        openAddMedicineModal,
        openEditMedicineModal,
        closeMedicineModal,
        isAIAssistantOpen,
        toggleAIAssistant,
        openAIAssistantWithQuery,
        filters,
        setFilters,
        resetFilters
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
