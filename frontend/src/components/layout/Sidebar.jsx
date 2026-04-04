import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Palette, Users, Home, ChevronLeft, ChevronRight, X, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';

const Sidebar = ({ onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const firstLinkRef = useRef(null);
  const { user } = useAuthStore();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/subjects', icon: BookOpen, label: 'Subjects' },
    { path: '/styles', icon: Palette, label: 'Answer Styles' },
    { path: '/smart-studies', icon: Sparkles, label: 'Smart Studies' },
    { path: '/community', icon: Users, label: 'Community' }
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', icon: ShieldAlert, label: 'Admin Panel' });
  }

  const prevPathnameRef = useRef(location.pathname);
  useEffect(() => {
    if (onClose && prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
      
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusableElements = sidebarRef.current.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLinkClick = (e, path) => {
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 150);
    }
  };

  const getActiveState = (itemPath) => {
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <aside
      ref={sidebarRef}
      className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'w-16 sm:w-20' 
          : 'w-64 sm:w-72'
      } ${
        onClose 
          ? 'h-full' 
          : 'sticky top-[3.5rem] sm:top-[4rem] lg:top-[5rem] h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]'
      } overflow-hidden flex flex-col`}
    >
      {/* Desktop Toggle Button */}
      {!onClose && (
        <div className="flex justify-end p-3 border-b border-slate-200/50 dark:border-slate-800/50 hidden md:flex">
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
      )}

      {/* Mobile close button and hint */}
      {onClose && (
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between sticky top-0 z-10">
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Menu</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/40 dark:hover:text-rose-400 transition-colors"
            aria-label="Close menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = getActiveState(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  ref={index === 0 ? firstLinkRef : null}
                  to={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold shadow-sm border border-blue-100 dark:border-blue-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  } ${
                    isCollapsed ? 'justify-center border-none !px-2' : ''
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                    }`} 
                  />
                  {!isCollapsed && (
                    <span className="text-sm sm:text-base whitespace-nowrap truncate tracking-wide">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {onClose && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 text-xs font-medium text-slate-400 dark:text-slate-500 text-center mt-auto">
          Tap outside to close
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
