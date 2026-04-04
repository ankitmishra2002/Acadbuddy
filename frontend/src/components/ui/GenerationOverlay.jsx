import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

const accentMap = {
  violet: 'from-violet-600 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-500',
  blue: 'from-blue-600 to-cyan-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
};

const GenerationOverlay = ({
  open,
  title,
  description,
  accent = 'violet',
  fullscreen = false,
}) => {
  const gradient = accentMap[accent] || accentMap.violet;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${fullscreen ? 'fixed inset-0 z-[180]' : 'absolute inset-0 z-20'} overflow-hidden rounded-[inherit]`}
        >
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-md" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center px-6"
          >
            <div className="w-full max-w-md rounded-4xl border border-white/10 bg-[#0b1020]/92 p-8 text-center shadow-2xl shadow-black/40">
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br ${gradient} text-white shadow-lg shadow-black/20`}>
                <Loader2 size={28} className="animate-spin" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                <Sparkles size={12} className="text-violet-400" />
                Generating with AI
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.15, ease: 'easeInOut' }}
                    className={`h-1.5 rounded-full bg-linear-to-r ${gradient}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationOverlay;