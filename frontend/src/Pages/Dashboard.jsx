import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Zap, Star, Layout, 
  ArrowUpRight, Clock, Box, Play,
  Plus, Upload, Sparkles, Brain
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white dark:bg-white/[0.04] p-5 rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-sm dark:shadow-none backdrop-blur-sm"
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="text-gray-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</span>
      <span className="text-emerald-500 text-[10px] font-bold pb-0.5 flex items-center gap-0.5 animate-pulse">
        <ArrowUpRight size={10} /> +12%
      </span>
    </div>
  </motion.div>
);

const SubjectPreview = ({ name, progress, units, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
      <Box size={22} className="text-white" />
    </div>
    <div className="flex-1">
      <h4 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight mb-1">{name}</h4>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className={`h-full bg-gradient-to-r ${color}`} 
          />
        </div>
        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 whitespace-nowrap">{progress}%</span>
      </div>
      <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-medium italic">{units} Ready</div>
    </div>
    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all transform group-hover:rotate-12">
      <Play size={14} className="fill-current" />
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* ── Welcome Header ── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-violet-500 font-bold text-sm uppercase tracking-widest">
              <Sparkles size={16} />
              Good Morning, John
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600">crush your syllabus?</span>
            </h1>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-shadow self-start md:self-auto"
          >
            <Plus size={18} />
            Add New Subject
          </motion.button>
        </section>

        {/* ── Grid Stats ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Notes Generated" value="128" icon={FileText} color="bg-violet-600" delay={0.1} />
          <StatCard label="Study Streak" value="14d" icon={Zap} color="bg-amber-500" delay={0.2} />
          <StatCard label="Course Points" value="2,450" icon={Star} color="bg-indigo-500" delay={0.3} />
          <StatCard label="Hours Saved" value="48h" icon={Clock} color="bg-emerald-500" delay={0.4} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── Progress Section ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layout size={20} className="text-violet-500" />
                Active Subjects
              </h3>
              <button className="text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors uppercase tracking-wider">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SubjectPreview name="Database Management" progress={78} units="Unit 1-4" color="from-blue-500 to-indigo-600" delay={0.5} />
              <SubjectPreview name="Operating Systems" progress={45} units="Unit 2 & 3" color="from-violet-500 to-fuchsia-600" delay={0.6} />
              <SubjectPreview name="Computer Architecture" progress={92} units="Unit 1-5" color="from-emerald-500 to-teal-600" delay={0.7} />
              <SubjectPreview name="Theory of Computation" progress={12} units="Unit 1" color="from-orange-500 to-rose-600" delay={0.8} />
            </div>
          </div>

          {/* ── AI Assistant Card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="relative group p-[1px] bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20"
          >
            <div className="h-full bg-white dark:bg-[#0c1020]/95 rounded-[23px] p-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={120} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  AI Assistant
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  Need help with <br className="hidden sm:block" />
                  a specific topic?
                </h3>
                
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                  Upload your syllabus or ask a question. AcadBuddy will generate tailored notes in seconds.
                </p>

                <div className="space-y-4 pt-4">
                  <button className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-[#0c1020] font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl hover:shadow-black/5 transition-all">
                    <Upload size={18} />
                    Upload Syllabus
                  </button>
                  <button className="w-full py-4 bg-violet-100 dark:bg-white/[0.06] text-violet-600 dark:text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 hover:bg-violet-200 dark:hover:bg-white/[0.1] transition-all">
                    Ask AcadBuddy AI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;