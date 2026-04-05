import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { recordFeatureVisit } from '../../utils/recentActivity';

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  // --- Dark Mode State Management ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  // ---------------------------------

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const path = location.pathname;
    if (/^\/subjects\/[^/]+/.test(path)) return;

    const routes = [
      [/^\/dashboard$/, 'dashboard', 'Dashboard'],
      [/^\/subjects$/, 'subjects', 'Subjects'],
      [/^\/smart-studies$/, 'smart-studies', 'Smart Studies'],
      [/^\/quick-rvsn$/, 'quick-rvsn', 'Quick Revision'],
      [/^\/styles$/, 'styles', 'Answer styles'],
      [/^\/profile$/, 'profile', 'Profile'],
      [/^\/community$/, 'community', 'Community'],
      [/^\/community\/.+/, 'community-post', 'Community post'],
      [/^\/content\/.+/, 'content-view', 'Saved content'],
    ];
    for (const [re, id, label] of routes) {
      if (re.test(path)) {
        recordFeatureVisit({ id, label, path });
        break;
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 relative flex flex-col w-full max-w-[100vw]">
      
      {/* Absolute Ambient Animated Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Light Mode Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] animate-blob dark:hidden"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] animate-blob animation-delay-2000 dark:hidden"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-[0.15] animate-blob animation-delay-4000 dark:hidden"></div>
        
        {/* Dark Mode Blobs */}
        <div className="hidden dark:block absolute top-[10%] -left-10 w-96 h-96 bg-indigo-900/40 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="hidden dark:block absolute top-[20%] -right-10 w-96 h-96 bg-blue-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="hidden dark:block absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Header 
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} 
          sidebarOpen={mobileSidebarOpen}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
        
        <div className="flex relative flex-1">
          {/* Desktop Sidebar */}
          <div className="hidden md:block transition-all duration-300 ease-in-out border-r border-slate-200/50 dark:border-slate-800/50 z-20">
            <Sidebar 
              isCollapsed={desktopSidebarCollapsed}
              onToggleCollapse={toggleDesktopSidebar}
            />
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileSidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                onClick={closeMobileSidebar}
                aria-hidden="true"
              />
              <div 
                className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl z-50 md:hidden border-r border-slate-200 dark:border-slate-800"
                ref={sidebarRef}
                style={{ transform: 'translateX(0)' }}
              >
                <Sidebar onClose={closeMobileSidebar} />
              </div>
            </>
          )}

          {/* Main Content */}
          <main 
            className={`flex-1 transition-all duration-300 ease-in-out p-3 sm:p-5 lg:p-8 w-full min-w-0 z-10`}
          >
            <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-200px)]">
              {children || <Outlet />}
            </div>
          </main>
        </div>
        <div className="relative z-20 mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
