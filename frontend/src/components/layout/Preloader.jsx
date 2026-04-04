import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

/* ─── Floating 3D Orb ─── */
const Orb = ({ size, color, x, y, z, delay, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      background: color,
      filter: `blur(${size * 0.3}px)`,
      transform: `translateZ(${z}px)`,
    }}
    initial={{ opacity: 0, scale: 0.3 }}
    animate={{
      opacity: [0, 0.6, 0.4, 0.7, 0.5],
      scale: [0.3, 1.1, 0.9, 1.05, 1],
      y: [0, -20, 10, -15, 0],
      x: [0, 10, -8, 5, 0],
    }}
    transition={{ duration, delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
  />
);

/* ─── Spinning Ring ─── */
const Ring = ({ size, color, duration, delay, rotateAxis = 'rotateX', opacity = 0.5 }) => (
  <motion.div
    className="absolute border-2 rounded-full"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderColor: color,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      opacity,
      boxShadow: `0 0 20px ${color}40`,
    }}
    animate={{ rotate: 360 }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  />
);

/* ─── Floating Particle Dot ─── */
const Dot = ({ delay }) => {
  const colors = ['#a78bfa', '#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#818cf8'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 100;
  const size = Math.random() * 4 + 2;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ width: size, height: size, left: `${x}%`, bottom: '-10px', background: color }}
      animate={{ y: [0, -(Math.random() * 300 + 200)], opacity: [0, 1, 0] }}
      transition={{ duration: Math.random() * 3 + 2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
};

/* ─── 3D Book Pages ─── */
const BookPage = ({ index, total }) => {
  const angle = (index / total) * 180 - 90;
  const color = `hsl(${240 + index * 20}, 70%, ${55 + index * 3}%)`;
  return (
    <motion.div
      className="absolute"
      style={{
        width: 60,
        height: 78,
        left: '50%',
        top: '50%',
        marginLeft: -30,
        marginTop: -39,
        background: `linear-gradient(135deg, ${color}aa, ${color}55)`,
        border: `1px solid ${color}88`,
        borderRadius: 4,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        backdropFilter: 'blur(4px)',
      }}
      animate={{
        rotateY: [angle - 10, angle + 5, angle - 10],
        opacity: [0.5, 0.9, 0.5],
      }}
      transition={{ duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }}
    />
  );
};

/* ─── Counter ─── */
const Counter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.floor(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.4, ease: 'easeOut' });
    const unsub = rounded.on('change', v => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [value]);

  return <span>{display}</span>;
};

/* ─── Main Preloader ─── */
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0: loading, 1: complete, 2: exit
  const [statusText, setStatusText] = useState('Initializing AI engine…');

  const statuses = [
    'Initializing AI engine…',
    'Loading academic models…',
    'Syncing university database…',
    'Calibrating study algorithms…',
    'Preparing your workspace…',
    'Almost there…',
  ];

  useEffect(() => {
    let prog = 0;
    const interval = setInterval(() => {
      const increment = Math.random() * 8 + 4;
      prog = Math.min(prog + increment, 100);
      setProgress(Math.floor(prog));

      const statusIdx = Math.floor((prog / 100) * (statuses.length - 1));
      setStatusText(statuses[statusIdx]);

      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setPhase(1), 400);
        setTimeout(() => setPhase(2), 1400);
        setTimeout(() => onComplete?.(), 2200);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#060812' }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Background ambient orbs ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ perspective: 800 }}>
            <Orb size={300} color="rgba(139,92,246,0.25)" x={10} y={5} z={-100} delay={0} duration={6} />
            <Orb size={220} color="rgba(99,102,241,0.2)" x={70} y={15} z={-50} delay={0.5} duration={7} />
            <Orb size={180} color="rgba(52,211,153,0.15)" x={80} y={70} z={-80} delay={1} duration={5} />
            <Orb size={250} color="rgba(96,165,250,0.18)" x={5} y={65} z={-60} delay={0.8} duration={8} />
            <Orb size={140} color="rgba(244,114,182,0.2)" x={50} y={80} z={-40} delay={0.3} duration={6.5} />

            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <Dot key={i} delay={i * 0.3} />
            ))}
          </div>

          {/* ── Grid overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          {/* ── Center 3D scene ── */}
          <div className="relative flex flex-col items-center justify-center" style={{ perspective: 1000 }}>

            {/* Outer glow ring halo */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 320,
                height: 320,
                background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* 3D rotating rings container */}
            <div className="relative" style={{ width: 200, height: 200, transformStyle: 'preserve-3d' }}>

              {/* Outer ring */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotateY: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Ring size={200} color="#7c3aed" duration={6} delay={0} opacity={0.6} />
              </motion.div>

              {/* Middle ring — different axis */}
              <motion.div
                className="absolute"
                style={{
                  width: 156, height: 156,
                  left: 22, top: 22,
                  transformStyle: 'preserve-3d',
                }}
                animate={{ rotateX: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Ring size={156} color="#4f46e5" duration={4} delay={0} opacity={0.7} />
              </motion.div>

              {/* Inner ring — diagonal */}
              <motion.div
                className="absolute"
                style={{
                  width: 110, height: 110,
                  left: 45, top: 45,
                  transformStyle: 'preserve-3d',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Ring size={110} color="#22d3ee" duration={3} delay={0} opacity={0.5} />
              </motion.div>

              {/* ── Center Logo ── */}
              <motion.div
                className="absolute flex items-center justify-center rounded-2xl"
                style={{
                  width: 72, height: 72,
                  left: '50%', top: '50%',
                  marginLeft: -36, marginTop: -36,
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(79,70,229,0.3)',
                }}
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(79,70,229,0.3)',
                    '0 0 60px rgba(124,58,237,0.9), 0 0 120px rgba(79,70,229,0.5)',
                    '0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(79,70,229,0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <GraduationCap size={34} className="text-white" />
              </motion.div>

              {/* ── Orbiting dots ── */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 8, height: 8,
                    left: '50%', top: '50%',
                    marginLeft: -4, marginTop: -4,
                    background: ['#a78bfa', '#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#818cf8'][i],
                    boxShadow: `0 0 10px ${['#a78bfa', '#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#818cf8'][i]}`,
                    transformOrigin: `${100 + i * 2}px 0px`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                />
              ))}
            </div>

            {/* ── Brand name ── */}
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                Acad<span className="text-violet-400">Buddy</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
                AI Academic Companion
              </p>
            </motion.div>

            {/* ── Progress area ── */}
            <motion.div
              className="mt-10 w-72 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Status text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusText}
                  className="text-slate-400 text-xs font-medium"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {phase === 1 ? '✓ Ready to launch' : statusText}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar track */}
              <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #22d3ee)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              </div>

              {/* Percentage */}
              <div className="text-slate-500 text-xs tabular-nums">
                <Counter value={progress} />%
              </div>
            </motion.div>

            {/* ── Phase 1: Complete state ── */}
            <AnimatePresence>
              {phase === 1 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                >
                  <div
                    className="w-full h-full rounded-full absolute"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Bottom tagline ── */}
          <motion.p
            className="absolute bottom-10 text-slate-700 text-xs tracking-widest font-medium uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Study Smarter · Score Higher
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;