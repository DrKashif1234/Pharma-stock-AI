import React from 'react';
import { useApp } from '../contexts/AppContext';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  Pill, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  QrCode, 
  Plus, 
  Sparkles, 
  FileText, 
  ArrowLeftRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import { cn } from '../utils/cn';

export const DashboardPage: React.FC = () => {
  const { 
    metrics, 
    loading, 
    setActivePage, 
    openAddMedicineModal, 
    openQRScanner, 
    openAIAssistantWithQuery,
    setFilters 
  } = useApp();

  if (loading || !metrics) {
    return <LoadingSpinner fullScreen message="Loading Healthcare Dashboard Analytics..." />;
  }

  // Colors for Pie chart
  const COLORS = ['#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'];

  const handleStatClick = (filterStatus: string) => {
    if (filterStatus === 'expired' || filterStatus === 'near_expiry') {
      setActivePage('expiry');
    } else if (filterStatus === 'low_stock' || filterStatus === 'out_of_stock') {
      setFilters(prev => ({ ...prev, status: filterStatus }));
      setActivePage('inventory');
    } else {
      setActivePage('inventory');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Critical Clinical Alert Banner if expired or stockout exists */}
      {(metrics.expiredCount > 0 || metrics.outOfStockCount > 0) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">Attention Required: Clinical Inventory Alerts Active</h4>
              <p className="text-xs text-rose-100">
                Found {metrics.expiredCount} expired batch(es) requiring quarantine and {metrics.outOfStockCount} out-of-stock item(s).
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              onClick={() => setActivePage('expiry')}
              className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all"
            >
              Review Expiries
            </button>
            <button
              onClick={() => openAIAssistantWithQuery("What should I reorder or quarantine today?")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/60 text-white text-xs font-semibold transition-all flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Quick Action Shortcut Pills (Bento Header Actions) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Workflow Actions:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddMedicineModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Medicine</span>
          </button>
          <button
            onClick={openQRScanner}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-2xs transition-all"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={() => setActivePage('stock')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Log Stock In / Out</span>
          </button>
          <button
            onClick={() => openAIAssistantWithQuery("Generate an executive inventory summary for today.")}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-2xs transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Reorder Analysis</span>
          </button>
          <button
            onClick={() => setActivePage('reports')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Top Bento Row: 4 Stat Cards */}
        <StatCard
          title="Total Medicines"
          value={formatNumber(metrics.totalMedicines)}
          icon={<Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          subtitle="Active pharmaceutical lines"
          colorScheme="cyan"
          onClick={() => handleStatClick('all')}
        />
        <StatCard
          title="Total Stock Quantity"
          value={formatNumber(metrics.totalStockQuantity)}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Units across all batches"
          colorScheme="emerald"
          onClick={() => handleStatClick('all')}
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(metrics.inventoryValue)}
          icon={<DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          subtitle="Based on purchase cost"
          colorScheme="indigo"
        />
        <StatCard
          title="Low Stock Alerts"
          value={formatNumber(metrics.lowStockCount)}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          subtitle="Below safety threshold"
          colorScheme="amber"
          trend={metrics.lowStockCount > 0 ? { value: 'Action Needed', isPositive: false } : { value: 'Optimal', isPositive: true }}
          onClick={() => handleStatClick('low_stock')}
        />

        {/* Middle Bento Row: Stock Movement (spans 3 cols) + Bento AI Tile (spans 1 col, 2 rows) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Monthly Stock Movement</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  6-Month Trend
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparison of Stock In (purchases) vs Stock Out (dispensing/sales)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Stock In</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Stock Out</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyMovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="stockIn" name="Stock In (Units)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="stockOut" name="Stock Out (Units)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento AI Tile from Design HTML (spans 1 col, 2 rows) */}
        <div className="lg:col-span-1 lg:row-span-2 p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  AI
                </div>
                <span className="font-bold text-sm text-white">PharmaStock AI</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                <span>●</span> Online
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Real-Time Clinical Insights
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl text-xs leading-relaxed mb-3 border-l-3 border-blue-500 text-slate-200">
              <div className="font-semibold text-blue-400 mb-1">Safety Stock Analysis:</div>
              {metrics.lowStockCount > 0 
                ? `${metrics.lowStockCount} items have fallen below their automated safety reorder threshold. Recommend generating instant POs.`
                : 'All inventory items are currently operating at healthy safety stock margins.'}
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl text-xs leading-relaxed mb-3 border-l-3 border-amber-500 text-slate-200">
              <div className="font-semibold text-amber-400 mb-1">FEFO Expiry Alert:</div>
              {metrics.nearExpiryCount > 0
                ? `${metrics.nearExpiryCount} batch lines require priority dispensing within 90 days to prevent financial write-off.`
                : 'No immediate batch expirations detected within the next 90 days.'}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => openAIAssistantWithQuery()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask me anything...</span>
            </button>
          </div>
        </div>

        {/* 3 Additional Stat Cards + AI Health Score (fitting next to 2nd row of Bento AI Tile) */}
        <StatCard
          title="Out of Stock"
          value={formatNumber(metrics.outOfStockCount)}
          icon={<AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          subtitle="Zero quantity remaining"
          colorScheme="rose"
          trend={metrics.outOfStockCount > 0 ? { value: 'Stockout', isPositive: false } : { value: '0 Stockouts', isPositive: true }}
          onClick={() => handleStatClick('out_of_stock')}
        />
        <StatCard
          title="Near Expiry (< 90d)"
          value={formatNumber(metrics.nearExpiryCount)}
          icon={<Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          subtitle="Monitor FEFO rotation"
          colorScheme="amber"
          onClick={() => handleStatClick('near_expiry')}
        />
        <StatCard
          title="Expired Medicines"
          value={formatNumber(metrics.expiredCount)}
          icon={<ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          subtitle="Immediate quarantine"
          colorScheme="rose"
          trend={metrics.expiredCount > 0 ? { value: 'Quarantine', isPositive: false } : { value: 'Safe', isPositive: true }}
          onClick={() => handleStatClick('expired')}
        />

        {/* Bento Row: Category Breakdown (spans 2 cols) + Expiry Timeline (spans 2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Inventory Breakdown by Category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total units and monetary valuation distribution</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {metrics.categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryBreakdown}
                  dataKey="quantity"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {metrics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${formatNumber(value)} units (${formatCurrency(props.payload.totalValue)})`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Medicine Expiry Risk Timeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Number of inventory lines scheduled for expiration by period</p>
            </div>
            <button
              onClick={() => setActivePage('expiry')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>Open Expiry Center</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.expiryTimeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${value} active items (${formatCurrency(props.payload.value)})`,
                    'Count'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Medicines Count" radius={[8, 8, 0, 0]}>
                  {metrics.expiryTimeline.map((entry, index) => {
                    let barColor = '#10b981'; // green for healthy
                    if (index === 0) barColor = '#ef4444'; // red for expired
                    else if (index === 1) barColor = '#f97316'; // orange for <30d
                    else if (index === 2) barColor = '#f59e0b'; // amber for <60d
                    else if (index === 3) barColor = '#eab308'; // yellow for <90d
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Row: Recent Inventory Transactions Table (spans all 4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Inventory Transactions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live audit log of purchases, dispensing, returns, and adjustments</p>
            </div>
            <button
              onClick={() => setActivePage('stock')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>View All Transactions</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Medicine Name</th>
                  <th className="py-3.5 px-5">Batch #</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5 text-right">Qty Shift</th>
                  <th className="py-3.5 px-5">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {metrics.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap font-medium">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {tx.medicine_name}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {tx.batch_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center",
                        tx.transaction_type === 'STOCK_IN' 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" 
                          : (tx.transaction_type === 'STOCK_OUT' 
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300")
                      )}>
                        {tx.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {tx.reason}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-right font-mono text-sm">
                      <span className={tx.transaction_type === 'STOCK_IN' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {tx.transaction_type === 'STOCK_IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-medium">
                      {tx.operator || 'Pharmacist'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
