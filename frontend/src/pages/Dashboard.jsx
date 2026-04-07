import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  FileText,
  ChevronRight,
  Activity,
  Globe,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  User,
  Users,
  Zap,
  History,
  ExternalLink,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { getRecentFeatures } from '../utils/recentActivity';

function TopicDonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-600/80 bg-slate-950/95 px-3 py-2.5 text-xs text-white shadow-xl backdrop-blur-sm">
      <p className="font-semibold text-slate-100">{p.name}</p>
      <p className="text-emerald-400 mt-0.5">Avg accuracy: {p.accuracy}%</p>
      <p className="text-slate-400 mt-0.5">Attempts: {p.value}</p>
    </div>
  );
}

function ActivityDonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-600/80 bg-slate-950/95 px-3 py-2.5 text-xs text-white shadow-xl">
      <p className="font-semibold">{p.name}</p>
      <p className="text-slate-300 mt-0.5">Relative weight in your activity mix</p>
    </div>
  );
}

const featureIcon = (id) => {
  if (!id) return Sparkles;
  if (id.startsWith('workspace')) return BookOpen;
  if (id.startsWith('focus')) return Zap;
  if (id.includes('quick')) return Zap;
  if (id.includes('smart')) return Sparkles;
  if (id.includes('community')) return Users;
  if (id.includes('content')) return FileText;
  if (id === 'subjects') return LayoutGrid;
  if (id === 'styles') return Activity;
  if (id === 'profile') return User;
  if (id === 'dashboard') return Activity;
  return Sparkles;
};

const quickLinks = [
  {
    to: '/subjects',
    title: 'Subjects',
    desc: 'Courses, context & AI tools',
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    shadow: 'shadow-blue-500/25',
    icon: BookOpen,
  },
  {
    to: '/smart-studies',
    title: 'Smart Studies',
    desc: 'Summaries & keyword scans',
    gradient: 'from-violet-600 via-fuchsia-600 to-pink-700',
    shadow: 'shadow-fuchsia-500/25',
    icon: Sparkles,
  },
  {
    to: '/styles',
    title: 'Answer styles',
    desc: 'Tone, structure & presets',
    gradient: 'from-amber-500 via-orange-600 to-rose-700',
    shadow: 'shadow-amber-500/25',
    icon: Activity,
  },
  {
    to: '/community',
    title: 'Community',
    desc: 'Share & discover materials',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    shadow: 'shadow-emerald-500/25',
    icon: Globe,
  },
  {
    to: '/quick-rvsn',
    title: 'Quick Revision',
    desc: 'Prompt-only revision packs',
    gradient: 'from-amber-500 via-orange-600 to-rose-700',
    shadow: 'shadow-amber-500/25',
    icon: Zap,
  },
];

const Dashboard = () => {
  const { user, fetchUser } = useAuthStore();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [recentActivity, setRecentActivity] = useState(() => getRecentFeatures());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  useEffect(() => {
    const refresh = () => setRecentActivity(getRecentFeatures());
    refresh();
    window.addEventListener('acadbuddy-activity', refresh);
    return () => window.removeEventListener('acadbuddy-activity', refresh);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/dashboard') return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [progressRes, contentRes] = await Promise.all([
          api.get('/users/progress'),
          api.get('/users/recent-content?limit=8'),
        ]);
        if (!cancelled) {
          setStats(progressRes.data);
          setRecentContent(contentRes.data);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user?.name?.split?.(' ')?.[0] || 'there';

  const DONUT_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f97316',
    '#10b981',
    '#06b6d4',
    '#eab308',
    '#64748b',
  ];

  const topicPieData = useMemo(() => {
    const list = stats?.quiz?.topicAccuracy || [];
    return list.slice(0, 8).map((item) => ({
      name: item.topic.length > 22 ? `${item.topic.substring(0, 22)}…` : item.topic,
      value: Math.max(item.total || 1, 1),
      accuracy: Math.round(item.accuracy),
    }));
  }, [stats]);

  const activityPieData = useMemo(() => {
    const q = stats?.quiz?.totalQuestions ?? 0;
    const h = stats?.totalStudyTime ?? 0;
    const st = stats?.studyStreak ?? 0;
    const gen = stats?.generatedContentCount ?? 0;
    return [
      { name: 'Quiz attempts', value: Math.max(q, 0.01) },
      { name: 'AI items built', value: Math.max(gen, 0.01) },
      { name: 'Study hours (×4)', value: Math.max(h * 4, 0.01) },
      { name: 'Streak (×12)', value: Math.max(st * 12, 0.01) },
    ];
  }, [stats]);

  const formatStudyDisplay = (hours) => {
    const h = Number(hours);
    if (!Number.isFinite(h) || h <= 0) return '0h';
    if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
    const rounded = Math.round(h * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
  };

  const practiceCount = stats?.practiceQuestions ?? stats?.quiz?.totalQuestions ?? 0;
  const quizAttempts = stats?.quiz?.totalQuestions ?? 0;
  const accuracyDisplay =
    quizAttempts > 0 && stats?.quiz?.accuracy != null ? `${Math.round(stats.quiz.accuracy)}%` : '—';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <div className="space-y-8 w-full max-w-7xl mx-auto pb-10 animate-pulse">
        <div className="h-36 rounded-[2rem] bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-72 rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-72 rounded-[2rem] bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 sm:space-y-10 w-full max-w-7xl mx-auto pb-10 px-0 overflow-x-hidden"
    >
      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/90 via-blue-50/50 to-indigo-50/80 p-6 sm:p-10 shadow-[0_20px_60px_-20px_rgba(59,130,246,0.35)] dark:border-slate-800/80 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-indigo-950/50 dark:shadow-black/40"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/30 to-violet-500/20 blur-3xl dark:from-blue-500/20 dark:to-violet-600/10" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600/90 dark:text-blue-400/90 mb-2">
              {greeting}
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 dark:from-white dark:via-blue-200 dark:to-indigo-300">
              {displayName}
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Your learning command center — track progress, jump back into tools you use, and open fresh content in
              seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Start learning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/smart-studies"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-violet-500" />
              Smart Studies
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          {
            label: 'Questions',
            hint: 'Quizzes + mock & review Qs',
            value: practiceCount,
            icon: BookOpen,
            accent: 'from-sky-500 to-blue-600',
            bg: 'bg-sky-50 dark:bg-sky-950/40',
          },
          {
            label: 'Accuracy',
            hint: 'Live quizzes only',
            value: accuracyDisplay,
            icon: TrendingUp,
            accent: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          },
          {
            label: 'Streak',
            hint: 'Days with study or AI activity',
            value: `${stats?.studyStreak || 0}d`,
            icon: Award,
            accent: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
          },
          {
            label: 'Study time',
            hint: 'Focus sessions + quiz time',
            value: formatStudyDisplay(stats?.totalStudyTime),
            icon: Clock,
            accent: 'from-violet-500 to-purple-600',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-4 sm:p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70"
              title={stat.hint}
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-[0.07] bg-gradient-to-br ${stat.accent}`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 line-clamp-2">
                    {stat.hint}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} text-white shadow-inner`}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      {stats && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/95 via-blue-50/40 to-indigo-50/30 p-6 sm:p-8 shadow-[0_20px_50px_-25px_rgba(59,130,246,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-indigo-950/40 dark:shadow-black/30">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/25 to-violet-500/20 blur-3xl" />
            <div className="relative mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <PieChartIcon size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topic mix & accuracy</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Donut segments sized by attempts — hover for accuracy %
                </p>
              </div>
            </div>
            {topicPieData.length > 0 ? (
              <div className="relative h-[min(320px,42vh)] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={2.5}
                      strokeWidth={2}
                      stroke="rgba(15,23,42,0.35)"
                    >
                      {topicPieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                          className="drop-shadow-sm"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<TopicDonutTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-10 text-center dark:border-slate-700 dark:bg-slate-800/30">
                <PieChartIcon className="mb-2 text-slate-300 dark:text-slate-600" size={40} />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No topic data yet</p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">Take topic-tagged quizzes to populate this ring.</p>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white/95 via-violet-50/40 to-fuchsia-50/30 p-6 sm:p-8 shadow-[0_20px_50px_-25px_rgba(139,92,246,0.3)] backdrop-blur-xl dark:border-slate-800/80 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-violet-950/40">
            <div className="pointer-events-none absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-gradient-to-tr from-fuchsia-500/15 to-cyan-500/10 blur-3xl" />
            <div className="relative mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                <Activity size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity balance</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quiz attempts, AI items created, study hours, and streak (scaled so the ring stays readable)
                </p>
              </div>
            </div>
            <div className="relative h-[min(320px,42vh)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="88%"
                    paddingAngle={3}
                    strokeWidth={2}
                    stroke="rgba(15,23,42,0.35)"
                  >
                    {activityPieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={['#8b5cf6', '#10b981', '#06b6d4', '#f59e0b'][i % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ActivityDonutTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Recent content */}
        <motion.div
          variants={itemVariants}
          className="rounded-[2rem] border border-white/80 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent content</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-generated items you created</p>
              </div>
            </div>
            <Link
              to="/subjects"
              className="hidden text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 sm:inline"
            >
              Subjects
            </Link>
          </div>

          {Array.isArray(recentContent) && recentContent.length > 0 ? (
            <ul className="space-y-2">
              {recentContent.map((content) => (
                <li key={content._id}>
                  <Link
                    to={`/content/${content._id}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-blue-900/50 dark:hover:bg-slate-800"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
                          {String(content.type || '').replace('_', ' ')}
                        </span>
                        <span className="truncate font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {content.title}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {content.subjectId?.name || 'Subject'} {content.topic ? `· ${content.topic}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent content available.</p>
          )}
        </motion.div>

        {/* Recent app activity (local) */}
        <motion.div
          variants={itemVariants}
          className="rounded-[2rem] border border-white/80 bg-white/80 p-6 sm:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent activity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Features and pages you used on this device</p>
            </div>
          </div>

          {recentActivity.length > 0 ? (
            <ul className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {recentActivity.map((entry) => {
                const Icon = featureIcon(entry.id);
                let timeLabel = '';
                try {
                  timeLabel = formatDistanceToNow(new Date(entry.at), { addSuffix: true });
                } catch {
                  timeLabel = '';
                }
                return (
                  <li key={`${entry.id}-${entry.at}`}>
                    <Link
                      to={entry.path || '/dashboard'}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/90 to-white/80 p-3.5 transition hover:border-fuchsia-200 hover:shadow-sm dark:border-slate-800 dark:from-slate-800/40 dark:to-slate-900/40 dark:hover:border-fuchsia-900/40"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100/80 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">{entry.label}</p>
                        {timeLabel ? (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{timeLabel}</p>
                        ) : null}
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
              <History className="mb-3 text-slate-300 dark:text-slate-600" size={36} />
              <p className="font-medium text-slate-600 dark:text-slate-400">No activity yet</p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                As you use Smart Studies, subjects, and community, your recent tools will show up here.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick links grid */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Explore</h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jump anywhere</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${card.gradient} p-6 sm:p-8 text-white shadow-lg ${card.shadow} transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">{card.title}</h3>
                    <p className="mt-1 text-sm font-medium text-white/85">{card.desc}</p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 transition group-hover:bg-white group-hover:text-slate-900">
                    <ArrowRight size={18} className="-translate-x-0.5 transition group-hover:translate-x-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
