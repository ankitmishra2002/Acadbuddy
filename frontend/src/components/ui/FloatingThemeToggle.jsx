import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FloatingThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full bg-violet-600 dark:bg-white text-white dark:text-violet-600 shadow-2xl shadow-violet-500/30 dark:shadow-white/10 flex items-center justify-center transition-colors border-4 border-white dark:border-[#0c1020]"
        >
            <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                    >
                        <Sun size={24} className="fill-current" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                    >
                        <Moon size={24} className="fill-current" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default FloatingThemeToggle;
