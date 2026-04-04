import { useEffect, useState } from 'react';
import { Plus, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', formData);
      setShowModal(false);
      setFormData({ name: '', code: '' });
      fetchSubjects();
    } catch (error) {
      alert('Failed to create subject');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (error) {
      alert('Failed to delete subject');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 sm:space-y-8 pb-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center px-1">
        <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tighter pb-1 drop-shadow-sm">
          Subjects
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Subject</span>
        </button>
      </motion.div>

      {subjects.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <BookOpen size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No subjects configured</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">Create your first subject to start generating AI study notes, exams, and revision materials.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white border border-slate-200 text-slate-700 dark:text-slate-300 dark:text-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:border-slate-600 transition-all font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} className="text-blue-600" />
            Add Your First Subject
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <motion.div 
              variants={itemVariants}
              key={subject._id} 
              className="bg-white/80 dark:bg-slate-900/95 backdrop-blur-3xl border border-white dark:border-slate-800 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 transition-colors">{subject.name}</h3>
                  {subject.code && (
                    <span className="inline-block text-xs font-semibold tracking-wider uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                      {subject.code}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(subject._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete subject"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link
                  to={`/subjects/${subject._id}`}
                  className="flex items-center justify-between w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 group/btn text-slate-600 hover:text-blue-700 font-semibold px-5 py-3 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                >
                  Open Workspace
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl border border-white border-opacity-50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Subject</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200 mb-1.5 ml-1">
                    Subject Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures & Algorithms"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 dark:text-slate-200 mb-1.5 ml-1">
                    Subject Code <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS201"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400 uppercase"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 dark:text-slate-300 dark:text-slate-200 py-3 px-4 rounded-xl hover:bg-slate-50 dark:bg-slate-800/50 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 font-semibold transition-all transform hover:-translate-y-0.5"
                  >
                    Create Subject
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Subjects;
