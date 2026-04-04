import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Clock, Award, FileText, ChevronRight, Activity, Globe, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progressRes, sessionsRes, contentRes] = await Promise.all([
        api.get('/users/progress'),
        api.get('/sessions?limit=5'),
        api.get('/users/recent-content?limit=5')
      ]);

      setStats(progressRes.data);
      setRecentSessions(sessionsRes.data);
      setRecentContent(contentRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = stats?.quiz?.topicAccuracy?.slice(0, 5).map(item => ({
    topic: item.topic.length > 15 ? item.topic.substring(0, 15) + '...' : item.topic,
    accuracy: Math.round(item.accuracy)
  })) || [];

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
      className="space-y-6 sm:space-y-8 w-full overflow-x-hidden pb-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
        <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tighter pb-1 drop-shadow-sm">
          Dashboard
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
          <Activity size={16} className="text-blue-500" />
          Live Overview
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Questions', value: stats?.quiz?.totalQuestions || 0, icon: BookOpen, color: 'blue' },
          { label: 'Accuracy', value: stats?.quiz?.accuracy ? `${Math.round(stats.quiz.accuracy)}%` : '0%', icon: TrendingUp, color: 'green' },
          { label: 'Study Streak', value: `${stats?.studyStreak || 0} days`, icon: Award, color: 'yellow' },
          { label: 'Study Time', value: stats?.totalStudyTime ? `${Math.round(stats.totalStudyTime)}h` : '0h', icon: Clock, color: 'purple' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const bgColors = {
            blue: 'from-blue-50 to-blue-100/50 text-blue-600 border-blue-100',
            green: 'from-green-50 to-emerald-100/50 text-emerald-600 border-green-100',
            yellow: 'from-amber-50 to-yellow-100/50 text-amber-600 border-amber-100',
            purple: 'from-purple-50 to-fuchsia-100/50 text-purple-600 border-purple-100'
          };
          
          return (
            <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-5 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="order-2 sm:order-1 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate mb-1 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`order-1 sm:order-2 w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgColors[stat.color]} border shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts */}
      {chartData.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Topic-wise Accuracy</h2>
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={250} minHeight={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="accuracy" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Recent Generated Content */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Content</h2>
          </div>
          
          {recentContent.length > 0 ? (
            <div className="space-y-3">
              {recentContent.map((content) => (
                <Link
                  key={content._id}
                  to={`/content/${content._id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100 transition-all cursor-pointer gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md whitespace-nowrap border border-blue-200/50">
                        {content.type.replace('_', ' ')}
                      </span>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate group-hover:text-blue-600 transition-colors">{content.title}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-200 dark:text-slate-200">{content.subjectId?.name || 'Unknown Subject'}</span>
                      {content.topic && <span className="opacity-60">• {content.topic}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium ml-1">
                    <span className="bg-white dark:bg-slate-700 px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-600 hidden sm:block">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight size={16} strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                <FileText className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No content generated yet.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Visit your subjects to get started!</p>
             </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Sessions</h2>
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3 flex-grow">
              {recentSessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate mb-1">
                      {session.subjectId?.name || session.contentId?.title || 'Unknown Subject'}
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                       <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                         {new Date(session.startTime).toLocaleDateString()} • {session.mode}
                       </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm whitespace-nowrap">
                    {session.duration ? `${Math.round(session.duration / 60000)} min` : (
                      <span className="text-amber-600 dark:text-amber-400 animate-pulse">Ongoing</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
                <Clock className="text-slate-300 dark:text-slate-500 mb-3" size={32} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No active sessions.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Track time while studying topics.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions (CTAs) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
        <Link
          to="/subjects"
          className="relative overflow-hidden group bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-[30px] group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-xl mb-4 text-white">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight block">Manage Subjects</h3>
              <p className="text-blue-100/80 font-medium text-sm sm:text-base">Organize curricula and course files</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover:bg-white inline-flex group-hover:text-blue-600 transition-all duration-300">
              <ArrowRight size={20} className="-translate-x-1 group-hover:translate-x-0 transition-transform" />
            </div>
          </div>
        </Link>
        <Link
          to="/community"
          className="relative overflow-hidden group bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 text-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-[30px] group-hover:bg-white/20 transition-all duration-500"></div>
           <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-xl mb-4 text-white">
                <Globe size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight block">Explore Community</h3>
              <p className="text-emerald-100/80 font-medium text-sm sm:text-base">Discover & clone top-tier materials</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover:bg-white inline-flex group-hover:text-emerald-600 transition-all duration-300">
              <ArrowRight size={20} className="-translate-x-1 group-hover:translate-x-0 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
