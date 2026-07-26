import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Sparkles, Bot, User, Send, RefreshCw, ShieldCheck, ArrowRight, Zap, CheckCircle2, AlertTriangle, TrendingUp, Cpu } from 'lucide-react';
import { cn } from '../utils/cn';

export const AIPage: React.FC = () => {
  const { chatHistory, sendAIQuery, metrics, setActivePage, setFilters } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Perform a comprehensive health check on my pharmacy stock",
    "List all medicines with fewer than 20 units and suggest reorder quantities",
    "Which medicines are expiring within 60 days and need FEFO rotation?",
    "Summarize inventory financial valuation and stock movement trends",
    "What clinical quarantine actions should I take immediately?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async (queryText: string = inputQuery) => {
    if (!queryText.trim() || loadingAI) return;
    const q = queryText.trim();
    if (queryText === inputQuery) setInputQuery('');
    
    setLoadingAI(true);
    try {
      await sendAIQuery(q);
    } catch {
      // toast shown in context
    } finally {
      setLoadingAI(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'FILTER_EXPIRED') {
      setActivePage('expiry');
    } else if (action === 'VIEW_REORDER') {
      setFilters(prev => ({ ...prev, status: 'low_stock' }));
      setActivePage('inventory');
    } else if (action === 'VIEW_REPORTS' || action === 'VIEW_EXPIRY_ANALYTICS') {
      setActivePage('reports');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
            <Sparkles className="h-8 w-8 animate-pulse text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight">PharmaStock AI Clinical Assistant</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 border border-emerald-300/40 text-[11px] font-bold uppercase tracking-wider">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-sm text-cyan-100 max-w-xl mt-1 leading-relaxed">
              Real-time natural language synthesis of pharmaceutical stock, batch expiration risks, supplier lead times, and regulatory audit compliance.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 self-start md:self-center">
          <button
            onClick={() => handleSend("Analyze our inventory health and provide an executive summary for today.")}
            disabled={loadingAI}
            className="px-4 py-2.5 rounded-xl bg-white text-cyan-800 hover:bg-cyan-50 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Zap className="h-4 w-4 text-cyan-600" />
            <span>Generate Today's AI Assessment</span>
          </button>
        </div>
      </div>

      {/* AI Quick Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => { setFilters(prev => ({ ...prev, status: 'low_stock' })); setActivePage('inventory'); }}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-cyan-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reorder Forecast</span>
            <TrendingUp className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {metrics?.lowStockCount || 0} Batches &le; Safety Threshold
          </div>
          <p className="text-xs text-slate-500 mt-1">
            AI recommends initiating replenishment purchase orders with Pfizer and Novartis to prevent clinical stockouts.
          </p>
        </div>

        <div 
          onClick={() => setActivePage('expiry')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Quarantine</span>
            <AlertTriangle className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {(metrics?.expiredCount || 0) + (metrics?.nearExpiryCount || 0)} Attention Batches
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated FEFO analysis identified {metrics?.expiredCount || 0} expired item(s) for immediate write-off and {metrics?.nearExpiryCount || 0} within 90 days.
          </p>
        </div>

        <div 
          onClick={() => setActivePage('reports')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Compliance</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            100% Verified Barcodes
          </div>
          <p className="text-xs text-slate-500 mt-1">
            All pharmaceutical lines are assigned cryptographic QR metadata signatures ready for regulatory inspection export.
          </p>
        </div>
      </div>

      {/* Main AI Workspace: Chat Box + Prompts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
        
        {/* Workspace Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Cpu className="h-4 w-4 text-cyan-600" />
            <span>Interactive Pharmacist Intelligence Feed</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Session History: {chatHistory.length} messages
          </span>
        </div>

        {/* Quick Prompts Scroll Bar */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
            Try asking:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loadingAI}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all shadow-2xs flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/20 dark:bg-slate-950/10">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3.5 max-w-3xl",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-white font-bold text-xs",
                msg.role === 'user' 
                  ? "bg-slate-700 dark:bg-slate-600" 
                  : "bg-gradient-to-tr from-cyan-600 to-emerald-500"
              )}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              {/* Bubble */}
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "bg-cyan-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
              )}>
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.content}</div>

                {/* Metadata Recommendations */}
                {msg.metadata?.suggestedActions && msg.metadata.suggestedActions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-2">
                    {msg.metadata.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act.action)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800 transition-all"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                )}

                <span className="block text-[10px] opacity-60 mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loadingAI && (
            <div className="flex items-center gap-3.5 mr-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                <Bot className="h-5 w-5 animate-bounce" />
              </div>
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2.5 shadow-sm">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" />
                <span>Gemini 3.6 Flash is evaluating real-time stock balances, batch signatures & clinical rotation protocols...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              placeholder="Ask PharmaStock AI to forecast stock, analyze expiry batches, or draft reorder requisitions..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loadingAI}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loadingAI}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
            >
              {loadingAI ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="hidden sm:inline">Send Query</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
