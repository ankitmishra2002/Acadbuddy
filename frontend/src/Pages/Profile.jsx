import React, { useState } from 'react';
import { User, Mail, GraduationCap, School, MapPin, Settings, Bell, Shield, LogOut, Camera, Check } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';

const Profile = () => {
  const { user, logout } = useAuthStore();
  const { updateProfile, loading } = useUserStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || 1
  });
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* ── Header ── */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl uppercase">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <button className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-[#0c1020] border border-gray-200 dark:border-white/10 rounded-2xl text-violet-500 shadow-lg hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
              <Camera size={18} />
            </button>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Mail size={14} /> {user?.email}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-[10px] font-black uppercase tracking-widest leading-none">Student</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest leading-none">Verified</span>
            </div>
          </div>
        </div>

        {/* ── Settings Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap size={20} className="text-violet-500" />
                Academic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">University</label>
                  <input 
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">College</label>
                  <input 
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Branch</label>
                  <input 
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Semester</label>
                  <select 
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value, 10)})}
                    className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-white dark:bg-[#1a1f35]">Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="flex-1 py-4 bg-violet-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : (success ? <><Check size={18} /> Saved</> : 'Save Changes')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Settings... */}
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Settings</h3>
              <div className="space-y-1">
                {[
                  { label: 'Notifications', icon: Bell, checked: true },
                  { label: 'Privacy Mode', icon: Shield, checked: false },
                ].map(setting => (
                  <div key={setting.label} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer">
                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      <setting.icon size={16} className="text-gray-400" />
                      {setting.label}
                    </div>
                    <div className={`w-8 h-4 rounded-full relative ${setting.checked ? 'bg-violet-600' : 'bg-gray-300 dark:bg-white/10'} transition-colors`}>
                      <div className={`absolute top-0.5 ${setting.checked ? 'right-0.5' : 'left-0.5'} w-3 h-3 bg-white rounded-full shadow-sm`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={logout}
              className="w-full py-4 px-6 bg-rose-50 dark:bg-rose-500/10 text-rose-500 font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-rose-100"
            >
              <LogOut size={18} />
              Sign Out from Account
            </button>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;