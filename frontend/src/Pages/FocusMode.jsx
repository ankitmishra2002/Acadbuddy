import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Coffee, 
  Brain, Volume2, VolumeX, Maximize2,
  Settings, ChevronLeft, Sparkles, 
  CheckCircle2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FocusMode = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, short-break, long-break
  const [isMuted, setIsMuted] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      // Play sound if not muted
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : mode === 'short-break' ? 5 * 60 : 15 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'focus') setTimeLeft(25 * 60);
    else if (newMode === 'short-break') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (mode === 'focus' ? 25 * 60 : mode === 'short-break' ? 5 * 60 : 15 * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#0c1020] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000 ${
          mode === 'focus' ? 'bg-violet-600/10' : mode === 'short-break' ? 'bg-emerald-600/10' : 'bg-blue-600/10'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000 ${
          mode === 'focus' ? 'bg-indigo-600/10' : mode === 'short-break' ? 'bg-teal-600/10' : 'bg-indigo-600/10'
        }`} />
      </div>

      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
            <ChevronLeft size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Exit Session</span>
        </button>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-xl w-full">
        
        {/* Mode Selector */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-1.5 flex gap-2 w-full max-w-md shadow-2xl">
          {[
            { id: 'focus', label: 'Focus', icon: Brain },
            { id: 'short-break', label: 'Short Break', icon: Coffee },
            { id: 'long-break', label: 'Long Break', icon: Clock },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === m.id 
                  ? 'bg-white text-[#0c1020] shadow-xl' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <m.icon size={14} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Core Timer UI */}
        <div className="relative group">
           {/* Progress Ring */}
           <svg className="w-64 h-64 md:w-80 md:h-80 -rotate-90">
             <circle
               cx="50%"
               cy="50%"
               r="48%"
               className="stroke-white/5 fill-none"
               strokeWidth="4"
             />
             <motion.circle
               cx="50%"
               cy="50%"
               r="48%"
               className={`fill-none transition-all duration-1000 ${
                 mode === 'focus' ? 'stroke-violet-500' : mode === 'short-break' ? 'stroke-emerald-500' : 'stroke-blue-500'
               }`}
               strokeWidth="4"
               strokeDasharray="100 100"
               initial={{ strokeDashoffset: 100 }}
               animate={{ strokeDashoffset: 100 - progress }}
               strokeLinecap="round"
             />
           </svg>

           {/* Time Display */}
           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                key={timeLeft}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl md:text-8xl font-black tracking-tighter"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                {mode === 'focus' ? 'Work Session' : 'Rest Well'}
              </div>
           </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
           <button 
             onClick={resetTimer}
             className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
           >
              <RotateCcw size={24} />
           </button>
           
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={toggleTimer}
             className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all ${
               isActive 
                 ? 'bg-white text-[#0c1020] shadow-white/10' 
                 : 'bg-violet-600 text-white shadow-violet-500/20'
             }`}
           >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
           </motion.button>

           <button className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <Sparkles size={24} />
           </button>
        </div>

        {/* Active Task Info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 w-full max-w-md flex items-center justify-between">
           <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Current Goal</h4>
                 <p className="text-sm font-bold truncate max-w-[180px]">Prepare Unit 2: OS Concepts</p>
              </div>
           </div>
           <button className="text-xs font-black text-violet-500 hover:text-violet-400 uppercase tracking-widest underline decoration-2 underline-offset-4">Change</button>
        </div>

      </main>

      {/* Floating Elements */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pointer-events-none">
          <span>Ambient Rain</span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span>Lo-fi Beats</span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <span>Zen Mode</span>
      </div>
    </div>
  );
};

export default FocusMode;