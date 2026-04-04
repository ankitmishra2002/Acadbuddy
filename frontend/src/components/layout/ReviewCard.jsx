import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewCard = ({ name, role, university, content, rating, image }) => {
  return (
    <motion.div
        whileHover={{ y: -10 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 text-blue-500/10 pointer-events-none group-hover:text-blue-500/20 transition-colors">
        <Quote size={80} strokeWidth={3} />
      </div>

      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} fill={i < rating ? "#3b82f6" : "transparent"} className={i < rating ? "text-blue-500" : "text-slate-300"} />
        ))}
      </div>

      <p className="text-lg text-slate-700 dark:text-slate-200 font-medium mb-8 leading-relaxed italic">
        "{content}"
      </p>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 p-0.5 shadow-sm overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{name}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{role} • {university}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
