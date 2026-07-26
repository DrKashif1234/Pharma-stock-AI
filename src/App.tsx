import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/ui/Toast';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { MedicineModal } from './components/inventory/MedicineModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { QRScanPage } from './pages/QRScanPage';
import { StockPage } from './pages/StockPage';
import { ExpiryPage } from './pages/ExpiryPage';
import { AIPage } from './pages/AIPage';
import { ReportsPage } from './pages/ReportsPage';
import { SuppliersPage } from './pages/SuppliersPage';

const AppContent: React.FC = () => {
  const { activePage } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'qr':
        return <QRScanPage />;
      case 'stock':
        return <StockPage />;
      case 'expiry':
        return <ExpiryPage />;
      case 'ai':
        return <AIPage />;
      case 'reports':
        return <ReportsPage />;
      case 'suppliers':
        return <SuppliersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col lg:flex-row transition-colors duration-200 font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>PharmaStock AI</strong> — Academic Final-Year Clinical Healthcare SaaS Project
          </span>
          <span>
            Strict FEFO Rotation • QR Verification • Google Gemini 3.6 Flash Server-Side Architecture
          </span>
        </footer>
      </div>

      {/* Modals & Drawers */}
      <ToastContainer />
      <QRScannerModal />
      <MedicineModal />
      <AIAssistantDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
