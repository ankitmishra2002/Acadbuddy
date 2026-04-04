import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, BookOpen, 
  MoreVertical, Calendar, ArrowRight,
  TrendingUp, Layers, CheckCircle2,
  Clock, Star, GraduationCap
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const SubjectCard = ({ subject, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -6 }}
    className="group bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:bg-white/[0.06] transition-all"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg shadow-violet-500/20`}>
        <subject.icon size={24} className="text-white" />
      </div>
      <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>

    <div className="space-y-1 mb-5">
      <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
        {subject.name}
      </h3>
      <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
        {subject.branch} · Sem {subject.semester}
      </p>
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-gray-500 dark:text-slate-400">Preparation Progress</span>
        <span className="text-violet-500">{subject.progress}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${subject.progress}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3 }}
          className={`h-full bg-gradient-to-r ${subject.color}`} 
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mt-6">
      <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center">
        <Layers size={14} className="text-violet-500 mb-1" />
        <span className="text-gray-900 dark:text-white text-xs font-bold">{subject.units} Units</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter">Analysis</span>
      </div>
      <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center">
        <TrendingUp size={14} className="text-emerald-500 mb-1" />
        <span className="text-gray-900 dark:text-white text-xs font-bold">{subject.questions} PYQs</span>
        <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter">Patterns</span>
      </div>
    </div>

    <button className="mt-5 w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-[#0c1020] font-black text-sm rounded-2xl flex items-center justify-center gap-2 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-lg hover:shadow-violet-600/20">
      Open Workspace
      <ArrowRight size={16} />
    </button>
  </motion.div>
);

const Subjects = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const subjectList = [
    { name: 'Database Management', branch: 'CSE', semester: '5', progress: 78, units: 5, questions: 42, icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
    { name: 'Operating Systems', branch: 'CSE', semester: '4', progress: 45, units: 6, questions: 58, icon: Layers, color: 'from-violet-500 to-fuchsia-600' },
    { name: 'Discrete Maths', branch: 'IT', semester: '3', progress: 92, units: 5, questions: 35, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
    { name: 'Theory of Computation', branch: 'CSE', semester: '5', progress: 12, units: 5, questions: 28, icon: Star, color: 'from-orange-500 to-rose-600' },
    { name: 'Computer Networks', branch: 'CSE', semester: '6', progress: 65, units: 6, questions: 50, icon: GraduationCap, color: 'from-cyan-500 to-blue-600' },
  ];

  const filteredSubjects = subjectList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* ── Header ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Manage <span className="text-violet-500">Subjects</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              A complete overview of your academic preparation.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button className="p-3 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              <Filter size={18} />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-violet-600 text-white font-black text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-violet-500/30 whitespace-nowrap"
            >
              <Plus size={18} />
              Add Subject
            </motion.button>
          </div>
        </section>

        {/* ── Subject Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredSubjects.map((subject, i) => (
              <SubjectCard key={subject.name} subject={subject} delay={i * 0.1} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Empty State ── */}
        {filteredSubjects.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/50 dark:bg-white/[0.02] rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/[0.06]"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-gray-500 dark:text-slate-400">Try adjusting your search or add a new subject.</p>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Subjects;