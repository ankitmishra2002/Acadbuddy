import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { isFocusModeActive, subscribeFocusMode } from '../utils/focusModeGate';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: {
    Icon: CheckCircle2,
    bar: 'from-emerald-500 to-teal-500',
    ring: 'border-emerald-200/80 dark:border-emerald-800/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    Icon: XCircle,
    bar: 'from-rose-500 to-red-600',
    ring: 'border-rose-200/80 dark:border-rose-900/50',
    icon: 'text-rose-600 dark:text-rose-400',
  },
  warning: {
    Icon: AlertTriangle,
    bar: 'from-amber-500 to-orange-500',
    ring: 'border-amber-200/80 dark:border-amber-900/50',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    Icon: Info,
    bar: 'from-blue-500 to-indigo-600',
    ring: 'border-blue-200/80 dark:border-blue-900/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
};

function ToastViewport({ toasts, onDismiss }) {
  const focusActive = useSyncExternalStore(subscribeFocusMode, isFocusModeActive, isFocusModeActive);
  if (typeof document === 'undefined') return null;
  if (focusActive) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[99999] flex flex-col items-end gap-2 p-3 sm:p-4 sm:items-end"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const cfg = styles[t.type] || styles.info;
          const Icon = cfg.Icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="pointer-events-auto w-full max-w-[min(100%,24rem)]"
            >
              <div
                className={`relative overflow-hidden rounded-2xl border bg-white/95 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:bg-slate-900/95 dark:shadow-black/40 ${cfg.ring}`}
              >
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${cfg.bar}`} />
                <div className="flex gap-3 pl-4 pr-2 py-3.5 sm:pl-5 sm:pr-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.icon}`} aria-hidden />
                  <div className="min-w-0 flex-1 text-sm">
                    {t.title ? (
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                    ) : null}
                    <p
                      className={`whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200 ${t.title ? 'mt-0.5 text-[13px] leading-snug' : 'font-medium'}`}
                    >
                      {t.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDismiss(t.id)}
                    className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const push = useCallback(
    (message, opts = {}) => {
      if (isFocusModeActive()) {
        return null;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const { type = 'info', duration = 4800, title } = opts;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      success: (message, opts) => push(message, { ...opts, type: 'success' }),
      error: (message, opts) => push(message, { ...opts, type: 'error', duration: opts?.duration ?? 6500 }),
      info: (message, opts) => push(message, { ...opts, type: 'info' }),
      warning: (message, opts) => push(message, { ...opts, type: 'warning' }),
      dismiss: remove,
      dismissAll,
    }),
    [push, remove, dismissAll]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
