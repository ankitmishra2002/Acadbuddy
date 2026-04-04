import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    university: '',
    college: '',
    branch: '',
    semester: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData);

      if (result.success) {
        // Check user role from store and redirect accordingly
        const { user } = useAuthStore.getState();
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <BookOpen className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-white">Academic Help Buddy</span>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-300">
              {isLogin
                ? 'Login to continue your exam preparation'
                : 'Start your personalized university prep journey'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup Fields */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4"
              >
                <p className="text-xs text-indigo-300 font-medium">
                  Fill all details carefully to complete registration.
                </p>
                <GlassInput label="Full Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <GlassInput label="University" value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })} />
                <GlassInput label="College" value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })} />
                <GlassInput label="Branch" value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })} />
                <GlassInput label="Semester" type="number" min="1" max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} />
              </motion.div>
            )}

            <GlassInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 pr-12 text-sm text-white placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
            >
              {loading ? 'Please wait…' : isLogin ? 'Login to Continue' : 'Create Account'}
            </motion.button>
          </form>


          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>

          {/* Return to home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Return to Landing Page
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* Reusable Glass Input */
const GlassInput = ({ label, type = 'text', ...props }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-200">{label}</label>
    <input
      type={type}
      required
      {...props}
      className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

export default Login;
