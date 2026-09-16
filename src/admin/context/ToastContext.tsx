import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastMethods = useMemo(
    () => ({
      success: (msg: string, dur?: number) => showToast(msg, 'success', dur),
      error: (msg: string, dur?: number) => showToast(msg, 'error', dur),
      info: (msg: string, dur?: number) => showToast(msg, 'info', dur),
      warning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, toast: toastMethods }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';

          const borderClass = isSuccess
            ? 'border-emerald-200'
            : isError
            ? 'border-rose-200'
            : isWarning
            ? 'border-amber-200'
            : 'border-indigo-200';

          const iconColor = isSuccess
            ? 'text-emerald-500'
            : isError
            ? 'text-rose-500'
            : isWarning
            ? 'text-amber-500'
            : 'text-indigo-500';

          const iconBg = isSuccess
            ? 'bg-emerald-50'
            : isError
            ? 'bg-rose-50'
            : isWarning
            ? 'bg-amber-50'
            : 'bg-indigo-50';

          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border ${borderClass} shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
                {isSuccess && <CheckCircle2 size={18} />}
                {isError && <AlertCircle size={18} />}
                {isWarning && <AlertTriangle size={18} />}
                {item.type === 'info' && <Info size={18} />}
              </div>

              <div className="flex-1 pt-0.5 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 leading-snug break-words">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
