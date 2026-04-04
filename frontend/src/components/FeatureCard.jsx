import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const FeatureCard = ({ title, description, icon: Icon, gradient }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['17.5deg', '-17.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-17.5deg', '17.5deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: 'preserve-3d',
      }}
      className="relative h-96 w-full rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl transition-all hover:scale-[1.02] cursor-pointer border border-slate-700/50"
    >
      <div 
        style={{ transform: 'translateZ(75px)', transformStyle: 'preserve-3d' }}
        className="absolute inset-4 grid place-content-center rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/5"
      >
        <div 
            style={{ transform: 'translateZ(50px)' }}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-4 mb-6 shadow-lg flex items-center justify-center mx-auto`}
        >
          <Icon size={40} className="text-white" />
        </div>
        <h3 
            style={{ transform: 'translateZ(50px)' }}
            className="text-2xl font-black text-white text-center mb-4 tracking-tight"
        >
          {title}
        </h3>
        <p 
            style={{ transform: 'translateZ(25px)' }}
            className="text-slate-400 text-center text-lg leading-relaxed max-w-[280px]"
        >
          {description}
        </p>
      </div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default FeatureCard;
