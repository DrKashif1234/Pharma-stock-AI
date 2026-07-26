import React from 'react';
import { useApp, PageView } from '../../contexts/AppContext';
import { 
  LayoutDashboard, 
  Pill, 
  QrCode, 
  ArrowLeftRight, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Truck, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activePage, setActivePage, metrics } = useApp();

  const navItems: { id: PageView; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      id: 'inventory', 
      label: 'Inventory Management', 
      icon: <Pill className="h-5 w-5" />,
      badge: metrics?.totalMedicines,
      badgeColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    },
    { 
      id: 'qr', 
      label: 'QR Code Inventory', 
      icon: <QrCode className="h-5 w-5" /> 
    },
    { 
      id: 'stock', 
      label: 'Stock Management', 
      icon: <ArrowLeftRight className="h-5 w-5" /> 
    },
    { 
      id: 'expiry', 
      label: 'Expiry Management', 
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: (metrics?.expiredCount || 0) + (metrics?.nearExpiryCount || 0),
      badgeColor: (metrics?.expiredCount || 0) > 0 
        ? 'bg-rose-500 text-white animate-pulse' 
        : ((metrics?.nearExpiryCount || 0) > 0 ? 'bg-amber-500 text-white' : undefined)
    },
    { 
      id: 'ai', 
      label: 'PharmaStock AI Assistant', 
      icon: <Sparkles className="h-5 w-5 text-cyan-500" />,
      badge: 1,
      badgeColor: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold'
    },
    { 
      id: 'reports', 
      label: 'Reports & Exports', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      id: 'suppliers', 
      label: 'Supplier Directory', 
      icon: <Truck className="h-5 w-5" /> 
    }
  ];

  const handleNavClick = (id: PageView) => {
    setActivePage(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed lg:static top-0 left-0 z-40 h-full w-64 bg-slate-900 dark:bg-slate-950 text-slate-100 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none p-4",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            P
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">
              PharmaStock AI
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span>●</span> Clinical SaaS v1.0
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-slate-800 text-white shadow-xs border-l-3 border-blue-500 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* User & AI Engine Footer (Bento Profile Box) */}
        <div className="mt-auto pt-4 space-y-3">
          {/* AI & System Status Box */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Gemini AI Engine
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                ● Online
              </span>
            </div>
            <button
              onClick={() => handleNavClick('ai')}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm flex items-center justify-center space-x-1.5 transition-all text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask PharmaStock AI</span>
            </button>
          </div>

          {/* User Profile Tile from Bento Design */}
          <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between border border-slate-700/60">
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider">USER PROFILE</div>
              <div className="text-xs font-bold text-white mt-0.5">Dr. Sarah Jenkins</div>
              <div className="text-[10px] text-slate-400">Lead Clinical Pharmacist</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
              SJ
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
