import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, ArrowRight, Sparkles, 
  ShieldCheck, Zap, GraduationCap 
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1020] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/40">
          
          {/* Logo Section */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20"
            >
              <GraduationCap size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Welcome <span className="text-violet-500">{isAdminMode ? 'Admin' : 'Back'}</span>
            </h1>
            <p className="text-slate-400 font-medium">
              {isAdminMode ? 'Management & Instructor Portal' : 'Continue your journey with AcadBuddy'}
            </p>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-white/[0.04] rounded-2xl border border-white/[0.08] mt-6 max-w-[240px] mx-auto">
              <button
                type="button"
                onClick={() => setIsAdminMode(false)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAdminMode ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setIsAdminMode(true)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAdminMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-2xl mb-6 flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@university.edu"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-violet-500 uppercase hover:text-violet-400 transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            Don't have an account? {' '}
            <Link to="/signup" className="text-white font-bold hover:text-violet-400 transition-colors">Join the family</Link>
          </p>

          {/* Social Proof/Features */}
          <div className="mt-10 pt-8 border-t border-white/[0.06] grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center mx-auto text-violet-500">
                <Sparkles size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">AI Ready</span>
            </div>
            <div className="text-center space-y-1">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto text-indigo-500">
                <Zap size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Fast Sync</span>
            </div>
            <div className="text-center space-y-1">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto text-blue-500">
                <ShieldCheck size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Secure</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">AcadBuddy v2.0 • Build for Success</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;