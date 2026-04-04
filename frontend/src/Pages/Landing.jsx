import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import {
  BookOpen,
  Users,
  Award,
  Zap,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  FileText,
  Calendar,
  Upload,
  Star,
  ChevronDown,
  Play,
  Menu,
  X,
  GraduationCap,
  Layers,
  Target,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';
import Footer from '../components/layout/Footer';
import Preloader from '../components/layout/Preloader';
import { useTheme } from '../context/ThemeContext';

const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: Math.random() * 4 + 4, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
  />
);

const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const Badge = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6"
  >
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
    {children}
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, accent, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative p-6 rounded-2xl bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] backdrop-blur-sm overflow-hidden cursor-default"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent} blur-2xl`} style={{ transform: 'scale(0.8)' }} />
      <div className="relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${accent} bg-opacity-20`}>
          <Icon size={20} className="text-gray-800 dark:text-white" />
        </div>
        <h3 className="text-gray-900 dark:text-white font-semibold text-base mb-2 leading-snug">{title}</h3>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const StatTicker = ({ value, label }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const num = parseInt(value.replace(/\D/g, ''), 10);
    let start = 0;
    const step = Math.ceil(num / 50);
    const interval = setInterval(() => {
      start += step;
      if (start >= num) {
        setCount(num);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-1 tabular-nums">
        {count}
        {value.replace(/\d/g, '')}
      </div>
      <div className="text-gray-500 dark:text-slate-400 text-sm font-medium">{label}</div>
    </div>
  );
};

const WorkflowStep = ({ num, title, desc, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 items-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-500/30">
        {num}
      </div>
      <div>
        <h4 className="text-gray-900 dark:text-white font-semibold text-base mb-1">{title}</h4>
        <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const CTAGradient = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        x: [0, 50, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[100px]"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, -45, 0],
        x: [0, -60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/25 rounded-full blur-[90px]"
    />
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)]"
    />
  </div>
);

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, fetchUser, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser();
    } else {
      useAuthStore.setState({ isAuthenticated: false, user: null });
    }
    
    // Simulate loading time (adjust as needed)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 4 + 2,
    height: Math.random() * 4 + 2,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    background: ['#a78bfa', '#34d399', '#60a5fa', '#f472b6'][i % 4],
  }));

  const features = [
    { icon: Brain, title: 'AI Study Notes', desc: 'Generate detailed, topic-specific notes from your syllabus instantly.', accent: 'from-violet-600/20 to-violet-900/10', delay: 0 },
    { icon: Target, title: 'Exam Blueprints', desc: 'Strategic preparation roadmaps based on your past year papers.', accent: 'from-blue-600/20 to-blue-900/10', delay: 0.08 },
    { icon: Calendar, title: 'Revision Planner', desc: 'Smart schedules that adapt to your exam dates and study pace.', accent: 'from-emerald-600/20 to-emerald-900/10', delay: 0.16 },
    { icon: FileText, title: 'Mock Papers', desc: 'Auto-generated practice tests from real previous year questions.', accent: 'from-orange-600/20 to-orange-900/10', delay: 0.24 },
    { icon: Layers, title: 'PPT & Reports', desc: 'Create presentation-ready content and academic reports in one click.', accent: 'from-pink-600/20 to-pink-900/10', delay: 0.32 },
    { icon: TrendingUp, title: 'Study Analytics', desc: 'Track progress, streaks, and quiz scores across all subjects.', accent: 'from-cyan-600/20 to-cyan-900/10', delay: 0.4 },
    { icon: Users, title: 'Community Feed', desc: 'Share and discover study materials from peers at your university.', accent: 'from-yellow-600/20 to-yellow-900/10', delay: 0.48 },
    { icon: MessageSquare, title: 'Answer Styles', desc: 'Customize tone, length, and structure for every generation.', accent: 'from-rose-600/20 to-rose-900/10', delay: 0.56 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#060812] text-gray-800 dark:text-white font-sans overflow-x-hidden transition-colors duration-300">
      <Preloader isLoading={isLoading} />

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-violet-600/10 dark:bg-violet-600/12 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] w-[400px] h-[400px] bg-indigo-500/8 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[400px] bg-emerald-600/6 dark:bg-emerald-600/8 rounded-full blur-[120px]" />
        {particles.map((p, i) => (
          <Particle key={i} style={{ width: p.width, height: p.height, top: p.top, left: p.left, background: p.background, opacity: 0.4 }} />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-100/80 dark:bg-[#060812]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06]' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap size={17} className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Acad<span className="text-violet-500 dark:text-violet-400">Buddy</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-slate-400 font-medium">
            {['Features', 'How it Works', 'Community', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200/50 dark:bg-white/5 hover:bg-gray-300/50 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-slate-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 text-sm font-semibold hover:bg-violet-500/20 transition-colors"
                  >
                    <ShieldAlert size={14} />
                    Admin Panel
                  </Link>
                )}
                <Link to="/dashboard" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-[#060812] text-sm font-bold rounded-lg hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">Sign in</Link>
                <Link to="/login" className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-[#060812] text-sm font-bold rounded-lg hover:bg-gray-700 dark:hover:bg-slate-100 transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setMenuOpen((v) => !v)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-gray-100/95 dark:bg-[#0c1020]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.06] px-5 py-5 flex flex-col gap-4"
            >
              {['Features', 'How it Works', 'Community', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium" onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="mt-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-lg text-center" onClick={() => setMenuOpen(false)}>
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-200/50 dark:bg-white/5 text-gray-700 dark:text-slate-300 text-sm font-medium"
              >
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 text-center">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full max-w-4xl mx-auto">
          <Badge>Now in Early Access - Join 2,000+ Students</Badge>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-gray-900 dark:text-white"
          >
            Study Smarter.
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Score Higher.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-gray-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            AcadBuddy is an AI academic companion built for university students.
            Upload your syllabus, and get instant notes, exam prep, mock papers, and revision plans - all tailored to your university.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-[#060812] font-bold text-sm rounded-xl overflow-hidden shadow-lg shadow-gray-900/10 dark:shadow-white/10 hover:shadow-gray-900/20 dark:hover:shadow-white/20 transition-shadow"
            >
              <span className="relative z-10">{isAuthenticated ? 'Go to Dashboard' : 'Start for Free'}</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-200/[0.6] dark:bg-white/[0.06] border border-gray-300 dark:border-white/[0.1] text-gray-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
            >
              <Play size={14} className="fill-current" />
              See how it works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 dark:from-violet-500/20 dark:to-indigo-500/10 blur-3xl rounded-3xl scale-110" />

            <div className="relative bg-white/80 dark:bg-[#0e1428]/90 border border-gray-200 dark:border-white/[0.1] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-white/[0.07] bg-gray-100/50 dark:bg-white/[0.03]">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-4 h-6 rounded bg-gray-200 dark:bg-white/[0.05] flex items-center px-3">
                  <span className="text-gray-500 dark:text-slate-500 text-xs">acadbuddy.ai/dashboard</span>
                </div>
              </div>

              <div className="p-5 grid grid-cols-3 gap-4 text-left">
                <div className="col-span-2 space-y-3">
                  <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold uppercase tracking-wider">Today's Generation</div>
                  {[
                    { label: 'Operating Systems - Unit 3 Notes', tag: 'Notes', color: 'bg-violet-500/20 text-violet-300', progress: 100 },
                    { label: 'DBMS Mock Paper - Sem 5', tag: 'Mock Paper', color: 'bg-blue-500/20 text-blue-300', progress: 72 },
                    { label: 'Networks Revision Sheet', tag: 'Revision', color: 'bg-emerald-500/20 text-emerald-300', progress: 45 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.12 }}
                      className="bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-800 dark:text-white text-xs font-medium truncate">{item.label}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${item.color}`}>{item.tag}</span>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1, delay: 1 + i * 0.15, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold uppercase tracking-wider">Stats</div>
                  {[
                    { label: 'Notes Generated', val: '47', icon: FileText },
                    { label: 'Study Streak', val: '12d', icon: Zap },
                    { label: 'Quiz Score', val: '84%', icon: Star },
                  ].map(({ label, val, icon: Icon }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl p-3"
                    >
                      <Icon size={13} className="text-gray-500 dark:text-slate-500 mb-1.5" />
                      <div className="text-gray-900 dark:text-white font-black text-xl leading-none">{val}</div>
                      <div className="text-gray-500 dark:text-slate-500 text-[10px] mt-0.5">{label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="absolute -left-6 top-1/3 bg-white dark:bg-[#0e1428] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-xl hidden md:flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Upload size={13} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-gray-800 dark:text-white text-xs font-semibold">Syllabus Uploaded</div>
                <div className="text-gray-500 dark:text-slate-500 text-[10px]">AI analyzing...</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.25 }}
              className="absolute -right-6 bottom-16 bg-white dark:bg-[#0e1428] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 shadow-xl hidden md:flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <CheckCircle size={13} className="text-violet-400" />
              </div>
              <div>
                <div className="text-gray-800 dark:text-white text-xs font-semibold">Notes Ready</div>
                <div className="text-gray-500 dark:text-slate-500 text-[10px]">3 units - 12 pages</div>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-gray-500 dark:text-slate-600 text-xs">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <ChevronDown size={16} className="text-gray-500 dark:text-slate-600" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-gray-200 dark:border-white/[0.06] py-8 overflow-hidden">
        <Reveal className="text-center text-gray-500 dark:text-slate-600 text-xs font-semibold uppercase tracking-widest mb-6">
          Trusted by students from top universities
        </Reveal>
        <div className="flex items-center justify-center gap-10 flex-wrap px-8">
          {['IIT Bombay', 'VIT Vellore', 'BITS Pilani', 'DTU Delhi', 'NIT Trichy', 'Jadavpur Univ.'].map((uni) => (
            <Reveal key={uni}>
              <span className="text-gray-600 dark:text-slate-500 text-sm font-semibold hover:text-gray-800 dark:hover:text-slate-300 transition-colors cursor-default">{uni}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 py-20 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: '50K+', label: 'Notes Generated' },
            { value: '12K+', label: 'Students Active' },
            { value: '98%', label: 'Accuracy Rate' },
            { value: '4.9', label: 'Avg Rating' },
          ].map((s) => (
            <StatTicker key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <Badge>Features</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">ace your exams</span>
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-base max-w-xl mx-auto">
              From syllabus upload to exam day - AcadBuddy covers every step of your academic journey.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <Badge>Simple Workflow</Badge>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">
                From upload to study-ready <span className="text-violet-500 dark:text-violet-400">in 30 seconds</span>
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-10 leading-relaxed">
                No setup headaches. Just pick your subject, upload your materials, and let AI do the heavy lifting.
              </p>
            </Reveal>
            <div className="space-y-7">
              {[
                { num: '01', title: 'Set up your profile', desc: 'Add your university, branch, semester, and subjects. Takes under a minute.' },
                { num: '02', title: 'Upload your materials', desc: 'Drop in your syllabus PDFs, past papers, or notes. AcadBuddy reads them all.' },
                { num: '03', title: 'Generate in one click', desc: 'Choose what you need - notes, mock paper, or revision planner - and get it instantly.' },
                { num: '04', title: 'Study, share, repeat', desc: 'Track your progress, share with peers, and keep your streak alive.' },
              ].map((step, i) => (
                <WorkflowStep key={i} {...step} delay={i * 0.1} />
              ))}
            </div>
          </div>

          <Reveal delay={0.2}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/5 dark:from-violet-600/15 dark:to-indigo-600/10 blur-3xl rounded-3xl" />
              <div className="relative bg-white/80 dark:bg-[#0e1428]/80 border border-gray-200 dark:border-white/[0.09] rounded-2xl p-6 backdrop-blur-xl">
                <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold uppercase tracking-wider mb-4">Generate Content</div>
                <div className="space-y-3">
                  {[
                    { label: 'Subject', value: 'Operating Systems', icon: BookOpen },
                    { label: 'Unit', value: 'Unit 3 - Memory Management', icon: Layers },
                    { label: 'Content Type', value: 'Comprehensive Notes', icon: FileText },
                    { label: 'Answer Style', value: 'Detailed Academic (Custom)', icon: Award },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
                      <Icon size={14} className="text-gray-500 dark:text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 dark:text-slate-500 text-[10px] font-semibold uppercase tracking-wide">{label}</div>
                        <div className="text-gray-800 dark:text-white text-sm font-medium">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-5 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30"
                >
                  <Sparkles size={15} />
                  Generate Notes
                </motion.button>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI analyzing your syllabus...
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: ['0%', '90%', '100%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="community" className="relative z-10 py-20 px-5 border-t border-gray-200 dark:border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <Badge>Community</Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-gray-900 dark:text-white">Learn together, grow faster</h2>
            <p className="text-gray-600 dark:text-slate-400 text-base max-w-xl mx-auto">
              Share notes, discover materials from peers at your university, and build a collective knowledge base.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Upload, title: 'Share Instantly', desc: 'Publish your generated notes to the community with one click.', color: 'from-violet-500 to-indigo-500' },
              { icon: Star, title: 'Upvote Quality', desc: 'Community voting surfaces the most accurate and helpful content.', color: 'from-orange-500 to-rose-500' },
              { icon: MessageSquare, title: 'Discuss & Collaborate', desc: 'Ask questions, start threads, and solve doubts together.', color: 'from-emerald-500 to-teal-500' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} className="bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6 text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-base mb-2">{title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-gray-900 dark:text-white">Students love AcadBuddy</h2>
            <p className="text-gray-600 dark:text-slate-500 text-sm">Real feedback from early users</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: 'Aryan M.', role: 'CSE, Sem 6 - VIT', text: 'Generated my entire OS unit notes in under 2 minutes. The accuracy was honestly surprising. Cleared my exam with distinction.', stars: 5 },
              { name: 'Priya S.', role: 'ECE, Sem 4 - BITS', text: 'The mock papers feature is a game changer. It pulls patterns from actual PYQs and generates fresh questions. My prep time halved.', stars: 5 },
              { name: 'Rahul K.', role: 'IT, Sem 5 - DTU', text: "Love the answer style customization. Set it to my professor's preferred format and all my assignments look professional now.", stars: 5 },
            ].map(({ name, role, text, stars }, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white/50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-5">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {name[0]}
                    </div>
                    <div>
                      <div className="text-gray-800 dark:text-white text-sm font-semibold">{name}</div>
                      <div className="text-gray-500 dark:text-slate-500 text-xs">{role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="relative z-10 py-24 px-5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-px shadow-2xl shadow-violet-500/20">
              <div className="relative bg-[#0b0f20]/90 dark:bg-[#060813]/95 rounded-[2.45rem] px-8 py-16 sm:py-20 text-center backdrop-blur-3xl overflow-hidden">
                <CTAGradient />

                <div className="relative z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 mb-8 backdrop-blur-md shadow-inner"
                  >
                    <GraduationCap size={32} className="text-white drop-shadow-md" />
                  </motion.div>

                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-sm">
                    Ready to transform your <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">study game?</span>
                  </h2>

                  <p className="text-indigo-200/80 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                    Join 2,000+ students leveraging AI to cut study time in half and ace their university exams.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to={isAuthenticated ? '/dashboard' : '/login'}
                        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 font-black text-base rounded-2xl shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] transition-all overflow-hidden"
                      >
                        <span className="relative z-10">{isAuthenticated ? 'Go to Dashboard' : "Get Started - It's Free"}</span>
                        <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                        <motion.div
                          className="absolute inset-0 bg-indigo-50"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: 0 }}
                          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                      </Link>
                    </motion.div>

                    <button className="px-8 py-4 text-white/70 hover:text-white font-bold transition-colors">Contact Sales</button>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-indigo-300/40 text-sm">
                    <span className="flex items-center gap-2"><CheckCircle size={14} /> No credit card required</span>
                    <span className="flex items-center gap-2"><CheckCircle size={14} /> Unlimited generations</span>
                    <span className="flex items-center gap-2"><CheckCircle size={14} /> Multi-device sync</span>
                  </div>
                </div>

                <div className="absolute top-10 left-10 w-24 h-24 border border-white/5 rounded-full blur-sm" />
                <div className="absolute bottom-10 right-10 w-32 h-32 border border-white/5 rounded-full blur-md" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
