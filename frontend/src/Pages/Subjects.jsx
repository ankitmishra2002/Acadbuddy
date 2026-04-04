import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, BookOpen, 
  MoreVertical, Calendar, ArrowRight,
  TrendingUp, Layers, CheckCircle2,
  Clock, Star, GraduationCap, X,
  Trash2
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useSubjectStore from '../store/subjectStore';
import { useNavigate } from 'react-router-dom';

const SubjectCard = ({ subject, delay, onDelete }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:bg-white/[0.06] transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg shadow-black/10`}>
          <subject.icon size={24} className="text-white" />
        </div>
        <div className="relative group/menu">
          <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <MoreVertical size={18} />
          </button>
          <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-[#1a1f35] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-1 opacity-0 group-hover/menu:opacity-100 invisible group-hover/menu:visible transition-all z-20">
            <button 
              onClick={() => onDelete(subject._id)}
              className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-5">
        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
          {subject.name}
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
          {subject.code}
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
        <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <Layers size={14} className="text-violet-500 mb-1" />
          <span className="text-gray-900 dark:text-white text-xs font-bold">{subject.units} Units</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter leading-none">Content</span>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <TrendingUp size={14} className="text-emerald-500 mb-1" />
          <span className="text-gray-900 dark:text-white text-xs font-bold">{subject.questions} PYQs</span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-tighter leading-none">Analysis</span>
        </div>
      </div>

      <button 
        onClick={() => navigate(`/subjects/${subject._id}`)}
        className="mt-5 w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-[#0c1020] font-black text-sm rounded-2xl flex items-center justify-center gap-2 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-lg hover:shadow-violet-600/20"
      >
        Open Workspace
        <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};


const Subjects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  
  const { subjects, fetchSubjects, addSubject, deleteSubject, loading } = useSubjectStore();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newName || !newCode) return;
    const result = await addSubject(newName, newCode);
    if (result.success) {
      setNewName('');
      setNewCode('');
      setIsModalOpen(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
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
              Real-time synchronization with your academic curriculum.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or code..."
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
              onClick={() => setIsModalOpen(true)}
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
              <SubjectCard 
                key={subject._id} 
                subject={subject} 
                delay={i * 0.1} 
                onDelete={deleteSubject}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Empty State ── */}
        {filteredSubjects.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white/50 dark:bg-white/[0.02] rounded-[40px] border-2 border-dashed border-gray-200 dark:border-white/[0.06] backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No subjects found</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Try adjusting your search or add a new subject to get started.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-8 text-violet-500 font-black flex items-center gap-2 mx-auto hover:gap-3 transition-all"
            >
              Add your first subject <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ── Add Subject Modal ── */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-white dark:bg-[#0c1020] rounded-[40px] border border-gray-200 dark:border-white/10 p-8 md:p-12 relative shadow-2xl overflow-hidden"
              >
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[80px] rounded-full" />
                
                <div className="flex justify-between items-center mb-10 relative">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      New <span className="text-violet-500">Subject</span>
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium text-sm mt-1">Add to your academic workspace</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddSubject} className="space-y-6 relative">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-2">Subject Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Artificial Intelligence"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-2">Subject Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CS-501"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-6 py-4 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400 dark:placeholder:text-slate-600"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 flex items-center justify-center gap-3 mt-4"
                  >
                    <Plus size={24} />
                    Create Subject
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Subjects;