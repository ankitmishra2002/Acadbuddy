import { Link } from "react-router-dom";
import { LogOut, User, Menu, X, Sun, Moon } from "lucide-react";
import useAuthStore from "../../store/authStore";

const Header = ({ onToggleSidebar, sidebarOpen, isDarkMode, onToggleTheme }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm sticky top-0 z-50 transition-colors duration-500 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Mobile Menu Button - Only show on mobile */}
            <button
              type="button"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleSidebar) {
                  onToggleSidebar();
                }
              }}
              className="md:hidden inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors touch-manipulation relative z-50"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            {/* Logo + Brand */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-all">
                <img
                  src="/logo_1.png"
                  alt="Academic Help Buddy Logo"
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 truncate tracking-tight hidden sm:block">
                AcadBuddy
              </h1>
            </Link>
          </div>
          
          {/* Right side actions - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Theme Toggle Button */}
            <button
                onClick={onToggleTheme}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-transparent shadow-sm"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                 <Sun size={20} className="animate-pulse" />
              ) : (
                 <Moon size={20} />
              )}
            </button>

            {/* User Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all py-2 px-3 sm:px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 touch-manipulation font-semibold"
              title={user?.name || "User Profile"}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg">
                <User size={18} strokeWidth={2.5} />
              </div>
              <span className="hidden md:inline text-sm sm:text-base truncate max-w-[120px] lg:max-w-none">
                {user?.name || "User"}
              </span>
            </Link>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 sm:gap-2.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all py-2 px-3 sm:px-4 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 touch-manipulation font-medium border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
