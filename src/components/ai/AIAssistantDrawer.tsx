import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sparkles, X, Send, RefreshCw, ShieldCheck, AlertTriangle, ArrowRight, Bot, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AIAssistantDrawer: React.FC = () => {
  const { isAIAssistantOpen, toggleAIAssistant, chatHistory, sendAIQuery, setFilters, setActivePage } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Which medicines expire this month?",
    "Show medicines with fewer than 10 units",
    "Suggest medicines to reorder immediately",
    "Summarize today's inventory stock changes",
    "Generate a clinical low-stock assessment"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAIAssistantOpen) {
      scrollToBottom();
    }
  }, [isAIAssistantOpen, chatHistory]);

  const handleSend = async (queryText: string = inputQuery) => {
    if (!queryText.trim() || loadingAI) return;
    const q = queryText.trim();
    if (queryText === inputQuery) setInputQuery('');
    
    setLoadingAI(true);
    try {
      await sendAIQuery(q);
    } catch {
      // toast shown by context
    } finally {
      setLoadingAI(false);
    }
  };

  const handleActionClick = (action: string) => {
    toggleAIAssistant();
    if (action === 'FILTER_EXPIRED') {
      setActivePage('expiry');
    } else if (action === 'VIEW_REORDER') {
      setFilters(prev => ({ ...prev, status: 'low_stock' }));
      setActivePage('inventory');
    } else if (action === 'VIEW_REPORTS' || action === 'VIEW_EXPIRY_ANALYTICS') {
      setActivePage('reports');
    }
  };

  if (!isAIAssistantOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={toggleAIAssistant}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">PharmaStock AI</h3>
              <p className="text-[11px] text-cyan-100 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Powered by Google Gemini 3.6 Flash</span>
              </p>
            </div>
          </div>
          <button
            onClick={toggleAIAssistant}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap flex gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
            Suggested Queries:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loadingAI}
              className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-slate-700 dark:text-slate-300 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all shadow-2xs flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-white font-bold text-xs",
                msg.role === 'user' 
                  ? "bg-slate-700 dark:bg-slate-600" 
                  : "bg-gradient-to-tr from-cyan-600 to-emerald-500"
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "bg-cyan-600 text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
              )}>
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">{msg.content}</div>

                {/* Metadata Recommendations / Action Pills */}
                {msg.metadata?.suggestedActions && msg.metadata.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-2">
                    {msg.metadata.suggestedActions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act.action)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-200 dark:border-cyan-800 transition-all"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="h-3 w-3" />
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
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-600" />
                <span>Synthesizing live inventory records & clinical safety rules...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about stock, expiry, or suppliers..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loadingAI}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-cyan-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loadingAI}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-white shadow-md transition-all flex items-center justify-center"
            >
              {loadingAI ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            PharmaStock AI strictly references live verified inventory. Always confirm physical batch records.
          </p>
        </div>

      </div>
    </>
  );
};
