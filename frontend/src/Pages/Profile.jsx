import { useState, useEffect } from 'react';
import { Save, ArrowLeft, User, GraduationCap, Building, BookOpen, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, fetchUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    college: '',
    branch: '',
    semester: '',
    hoursPerDay: '',
    preferredStudyTimes: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profile = response.data;
      setFormData({
        name: profile.name || '',
        university: profile.university || '',
        college: profile.college || '',
        branch: profile.branch || '',
        semester: profile.semester || '',
        hoursPerDay: profile.timeAvailability?.hoursPerDay || '',
        preferredStudyTimes: profile.timeAvailability?.preferredStudyTimes || []
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', {
        ...formData,
        timeAvailability: {
          hoursPerDay: parseInt(formData.hoursPerDay) || undefined,
          preferredStudyTimes: formData.preferredStudyTimes
        }
      });
      await fetchUser();
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-6 sm:space-y-8 w-full max-w-4xl mx-auto pb-8"
    >
      <motion.div variants={itemVariants} className="px-1">
        <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tighter pb-1 drop-shadow-sm">
          Profile Settings
        </h1>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all mt-2"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Back to Dashboard
        </Link>
      </motion.div>

      <motion.form 
        variants={itemVariants}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-300 dark:border-slate-600 p-6 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
           <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
             <User size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personal Information</h2>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Update your basic details and academic affiliations.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1 flex items-center gap-1.5">
              <User size={14} className="text-slate-400" /> Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1 flex items-center gap-1.5">
               <GraduationCap size={14} className="text-slate-400" /> University <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stanford University"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1 flex items-center gap-1.5">
               <Building size={14} className="text-slate-400" /> College <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. College of Engineering"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1 flex items-center gap-1.5">
               <BookOpen size={14} className="text-slate-400" /> Branch / Major <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700 mt-6">
           <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
             <Calendar size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Academic Progress</h2>
             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Set your semester and study preferences.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1 flex items-center gap-1.5">
               <Calendar size={14} className="text-slate-400" /> Current Semester <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="12"
              required
              placeholder="e.g. 5"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1 flex items-center gap-1.5">
               <Clock size={14} className="text-slate-400" /> Target Study Hours Per Day <span className="text-slate-400 font-normal ml-0.5">(Optional)</span>
            </label>
            <input
              type="number"
              min="1"
              max="24"
              placeholder="e.g. 4"
              value={formData.hoursPerDay}
              onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-bold text-base disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <Save size={20} className={saving ? "animate-pulse" : ""} />
            {saving ? 'Updating Profile...' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default Profile;
