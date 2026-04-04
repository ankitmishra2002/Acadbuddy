import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Zap, Star, Layout, 
  ArrowUpRight, Clock, Box, Play,
  Plus, Upload, Sparkles, Brain, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';
import useSubjectStore from '../store/subjectStore';
import useUserStore from '../store/userStore';
import { useNavigate, Link } from 'react-router-dom';

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
      <span className="text-emerald-500 text-[10px] font-bold pb-0.5 flex items-center gap-0.5">
        <ArrowUpRight size={10} /> +12%
      </span>
    </div>
  </motion.div>
);

const SubjectPreview = ({ id, name, progress, units, color, icon: Icon, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={() => navigate(`/subjects/${id}`)}
      className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-black/10`}>
        <Icon size={22} className="text-white" />
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
        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-medium italic">{units} Units Ready</div>
      </div>
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all transform group-hover:rotate-12">
        <Play size={14} className="fill-current" />
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { stats, fetchStats, recentContent, fetchRecentContent } = useUserStore();

  useEffect(() => {
    fetchSubjects();
    fetchStats();
    fetchRecentContent();
  }, []);

  const dashboardStats = [
    { label: "Hours Studied", value: `${stats?.totalStudyTime || 0}h`, icon: Clock, color: "bg-violet-600" },
    { label: "Study Streak", value: `${stats?.studyStreak || 0}d`, icon: Zap, color: "bg-amber-500" },
    { label: "Quiz Accuracy", value: `${stats?.quiz?.accuracy || 0}%`, icon: Star, color: "bg-indigo-500" },
    { label: "Total Sessions", value: `${stats?.totalSessions || 0}`, icon: Layout, color: "bg-emerald-500" },
  ];

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
              Welcome Back, {user?.name?.split(' ')[0] || 'Scholar'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600">crush your syllabus?</span>
            </h1>
          </motion.div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-violet-600/5 dark:bg-violet-600/10 p-8 rounded-[40px] border border-violet-500/20 shadow-inner">
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Need Study Material?</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Select a subject below to generate your lecture notes, mock tests or PPTs instantly.</p>
                <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                        onClick={() => navigate('/subjects')}
                        className="px-8 py-4 bg-violet-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-violet-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Sparkles size={18} />
                        ✨ Generate AI Notes Now
                    </button>
                    <button 
                        onClick={() => navigate('/ai-workspace')}
                        className="px-8 py-4 bg-white dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 font-black text-sm rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        Explore Tools
                    </button>
                </div>
            </div>
            
            <div className="hidden md:flex flex-col justify-center border-l border-violet-500/10 pl-10 space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-violet-500 uppercase tracking-widest">
                    <Star size={14} /> Pro Tip
                </div>
                <p className="text-gray-500 dark:text-late-400 text-xs leading-relaxed">
                    "Upload your syllabus in the <span className="text-violet-500">Subjects</span> section first to get the most accurate AI-generated content tailored to your university."
                </p>
            </div>
        </section>

        {/* ── Grid Stats ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={0.1 * (i + 1)} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── Progress Section ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Layout size={20} className="text-violet-500" />
                Your Subjects
              </h3>
              <button 
                onClick={() => navigate('/subjects')}
                className="text-sm font-bold text-violet-500 hover:text-violet-600 transition-colors uppercase tracking-wider"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {subjects.slice(0, 4).map((subject, i) => (
                  <SubjectPreview 
                    key={subject._id} 
                    id={subject._id}
                    name={subject.name} 
                    progress={subject.progress || 0} 
                    units={subject.units || 0} 
                    color={subject.color} 
                    icon={subject.icon}
                    delay={0.5 + (i * 0.1)} 
                  />
                ))}
                {subjects.length === 0 && (
                  <div className="col-span-2 py-8 bg-white/5 dark:bg-white/[0.02] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500">
                    <p className="font-medium text-sm">No subjects found</p>
                    <Link to="/subjects" className="text-violet-500 font-bold mt-2 hover:underline">Add one now</Link>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-10">
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
                    <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-black uppercase tracking-widest leading-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    AI Assistant
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    Need help with <br className="hidden sm:block" />
                    your studies?
                    </h3>
                    
                    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                    Generate revision notes, quizzes, or structured reports from your syllabus or external links.
                    </p>
                    
                    <div className="space-y-4 pt-4">
                    <button 
                      onClick={() => navigate('/subjects')}
                      className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-[#0c1020] font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl hover:shadow-black/5 transition-all"
                    >
                        <Upload size={18} />
                        Upload Syllabus
                    </button>
                    <button 
                      onClick={() => navigate('/ai-workspace')}
                      className="w-full py-4 bg-violet-100 dark:bg-white/[0.06] text-violet-600 dark:text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 hover:bg-violet-200 dark:hover:bg-white/[0.1] transition-all"
                    >
                        Get Revision Sheet
                    </button>
                    </div>
                </div>
                </div>
            </motion.div>

            {/* ── Recent Activity Section ── */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Clock size={20} className="text-violet-500" />
                Recent Activity
                </h3>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-[32px] overflow-hidden shadow-sm dark:shadow-none">
                    {[
                        { type: 'Notes', title: 'OS Context Switching', time: '2h ago', status: 'Generated' },
                        { type: 'Quiz', title: 'Data Structures MCQ', time: '5h ago', status: 'Completed' },
                        { type: 'Report', title: 'Cloud Computing Architecture', time: 'Yesterday', status: 'Viewed' },
                    ].map((item, i) => (
                        <div key={i} className={`p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i !== 2 ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{item.title}</h4>
                                    <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">{item.type} • {item.time}</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {item.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;