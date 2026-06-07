import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg, dur) => show(msg, 'success', dur), [show]);
  const error = useCallback((msg, dur) => show(msg, 'error', dur), [show]);
  const warning = useCallback((msg, dur) => show(msg, 'warning', dur), [show]);
  const info = useCallback((msg, dur) => show(msg, 'info', dur), [show]);
  const loading = useCallback((msg, dur = 0) => show(msg, 'loading', dur), [show]);

  const toast = { success, error, warning, info, loading, dismiss };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-status-emerald w-5 h-5 shrink-0" />;
      case 'error':
        return <AlertCircle className="text-status-rose w-5 h-5 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="text-status-amber w-5 h-5 shrink-0" />;
      case 'info':
        return <Info className="text-status-violet w-5 h-5 shrink-0" />;
      case 'loading':
        return <Loader2 className="text-primary w-5 h-5 animate-spin shrink-0" />;
      default:
        return null;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-status-emerald/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      case 'error':
        return 'border-status-rose/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
      case 'warning':
        return 'border-status-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'info':
        return 'border-status-violet/30 shadow-[0_0_15px_rgba(167,139,250,0.15)]';
      case 'loading':
        return 'border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]';
      default:
        return 'border-border';
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-slate-900/80 backdrop-blur-md text-white font-heading text-sm shadow-glass-md animate-slide-in transition-all duration-300 ${getBorderColor(t.type)}`}
          >
            {getIcon(t.type)}
            <div className="flex-1 font-medium leading-5">{t.message}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-white transition-all shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
