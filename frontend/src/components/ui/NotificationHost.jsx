import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from 'lucide-react';
import { subscribeNotifications } from '../../lib/notifications';

const variantConfig = {
  success: {
    icon: CheckCircle2,
    ring: 'ring-emerald-500/20',
    accent: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-100',
  },
  error: {
    icon: AlertCircle,
    ring: 'ring-rose-500/20',
    accent: 'from-rose-500 to-red-500',
    text: 'text-rose-100',
  },
  warning: {
    icon: TriangleAlert,
    ring: 'ring-amber-500/20',
    accent: 'from-amber-500 to-orange-500',
    text: 'text-amber-100',
  },
  info: {
    icon: Info,
    ring: 'ring-sky-500/20',
    accent: 'from-sky-500 to-indigo-500',
    text: 'text-sky-100',
  },
};

const NotificationHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeNotifications((toast) => {
    setToasts((current) => [...current, toast]);

    if (toast.duration !== 0) {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toast.duration || 4200);
    }
  }), []);

  const dismiss = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-200 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = variantConfig[toast.type] || variantConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, y: 24, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020]/95 p-4 text-white shadow-2xl shadow-black/30 ring-1 ${config.ring} backdrop-blur-xl`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${config.accent} text-white shadow-lg`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 space-y-1 pr-2">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-white">{toast.title}</p>
                  {toast.message && <p className={`text-sm leading-relaxed ${config.text}`}>{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default NotificationHost;