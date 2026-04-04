import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Users, Brain, 
  Target, Settings, LogOut, ChevronLeft, 
  ChevronRight, Sparkles, GraduationCap 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Subjects', icon: BookOpen, path: '/subjects' },
    { name: 'Community', icon: Users, path: '/community' },
    { name: 'Focus Mode', icon: Target, path: '/focus' },
    { name: 'AI Workspace', icon: Brain, path: '/ai-workspace' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 80 }}
      className="fixed left-0 top-0 h-full bg-white dark:bg-[#0c1020] border-r border-gray-200 dark:border-white/[0.06] z-40 flex flex-col transition-colors duration-300 shadow-xl dark:shadow-none"
    >
      {/* ── Logo ── */}
      <div className="h-20 flex items-center px-6 gap-3 mb-4">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <GraduationCap size={20} className="text-white" />
        </div>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-900 dark:text-white font-black text-xl tracking-tight whitespace-nowrap"
          >
            Acad<span className="text-violet-500 dark:text-violet-400">Buddy</span>
          </motion.span>
        )}
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold' 
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            <item.icon size={20} className="min-w-[20px]" />
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm tracking-wide"
              >
                {item.name}
              </motion.span>
            )}
            {isOpen && item.name === 'AI Workspace' && (
              <Sparkles size={12} className="text-amber-400 ml-auto animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-gray-100 dark:border-white/[0.06] space-y-1.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {isOpen && <span className="text-sm">Collapse Sidebar</span>}
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-3 rounded-xl transition-all
            ${isActive ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'}
          `}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
            JD
          </div>
          {isOpen && <span className="text-sm font-medium">John Doe</span>}
        </NavLink>

        <button
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all font-medium"
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
