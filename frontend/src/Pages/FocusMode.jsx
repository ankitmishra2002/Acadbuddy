import React, { useState, useEffect } from 'react';
import { Target, Clock, Sparkles, Brain, Wind, Headphones, Play, Pause, RotateCcw } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';

const FocusMode = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-black uppercase tracking-widest">
            <Target size={14} />
            Focus Session
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Minimalist <span className="text-violet-500">Study Space</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">
            Block distractions, time your sessions, and boost productivity.
          </p>
        </div>

        {/* ── Timer Section ── */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative max-w-md mx-auto aspect-square rounded-full border-[12px] border-gray-100 dark:border-white/[0.04] bg-white dark:bg-[#0c1020] shadow-2xl flex flex-col items-center justify-center space-y-4"
        >
          {/* Progress ring placeholder */}
          <div className="absolute inset-0 rounded-full border-[2px] border-violet-500/20" />
          
          <div className="text-7xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20 hover:scale-105 transition-all"
            >
              {isActive ? <Pause size={24} fill='currentColor' /> : <Play size={24} fill='currentColor' className='ml-1' />}
            </button>
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }}
              className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.06] text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </motion.div>

        {/* ── Ambient Sounds ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'White Noise', icon: Wind, color: 'bg-blue-500/10 text-blue-500' },
            { label: 'Lo-Fi Beats', icon: Headphones, color: 'bg-violet-500/10 text-violet-500' },
            { label: 'Rain Drops', icon: Wind, color: 'bg-emerald-500/10 text-emerald-500' },
            { label: 'Focus AI', icon: Brain, color: 'bg-indigo-500/10 text-indigo-500' },
          ].map(sound => (
            <button key={sound.label} className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] p-5 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.08] transition-all group">
              <div className={`w-12 h-12 rounded-2xl ${sound.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <sound.icon size={20} />
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{sound.label}</span>
            </button>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FocusMode;