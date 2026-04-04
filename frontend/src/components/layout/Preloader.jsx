import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const Preloader = ({ isLoading }) => {
  const containerVariants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }
  };

  const dotVariants = {
    animate: (i) => ({
      y: [0, -12, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.15,
        ease: 'easeInOut'
      }
    })
  };

  const scaleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  if (!isLoading) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 dark:bg-[#060812]"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-violet-600/10 dark:bg-violet-600/12 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-indigo-500/8 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo Animation */}
        <motion.div
          variants={scaleVariants}
          animate="animate"
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30"
        >
          <GraduationCap size={32} className="text-white" />
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Acad<span className="text-violet-500 dark:text-violet-400">Buddy</span>
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium">Preparing your study session...</p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
            />
          ))}
        </div>

        {/* Loading Bar */}
        <motion.div
          className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"
        >
          <motion.div
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="h-full w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;