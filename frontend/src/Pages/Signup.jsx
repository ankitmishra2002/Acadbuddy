import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, Building2, 
  BookOpen, Layers, GraduationCap,
  ArrowRight, Sparkles, ShieldCheck,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    college: '',
    branch: '',
    semester: 1,
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'semester' ? parseInt(value, 10) : value 
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
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
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/[0.08] rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/60">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Join <span className="text-violet-500">AcadBuddy</span>
            </h1>
            <p className="text-slate-400 font-medium">Create your profile and start learning</p>
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-10 bg-violet-500' : 'w-4 bg-white/10'}`} />
              ))}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  {/* Role Toggle */}
                  <div className="flex p-1 bg-white/[0.04] rounded-2xl border border-white/[0.08] mb-6">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'user' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.role === 'user' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <User size={14} /> Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ShieldCheck size={14} /> Instructor
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@university.edu"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-4 bg-white/[0.06] text-white font-black rounded-2xl border border-white/[0.08] hover:bg-white/[0.1] flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    Academic Details
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">University</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          name="university"
                          required
                          value={formData.university}
                          onChange={handleChange}
                          placeholder="State University"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">College</label>
                      <div className="relative">
                        <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          name="college"
                          required
                          value={formData.college}
                          onChange={handleChange}
                          placeholder="Tech Institute"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Branch</label>
                      <div className="relative">
                        <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          name="branch"
                          required
                          value={formData.branch}
                          onChange={handleChange}
                          placeholder="Computer Science"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Semester</label>
                      <div className="relative">
                        <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select 
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 appearance-none shadow-xl"
                        >
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#1a1f35]">Semester {s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-4 bg-white/[0.03] text-slate-400 font-bold rounded-2xl border border-white/5 hover:text-white transition-all"
                    >
                      Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      type="submit"
                      className="flex-[2] py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 flex items-center justify-center gap-2 group disabled:opacity-50 transition-all font-medium"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Complete Setup
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-white font-bold hover:text-violet-400 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
