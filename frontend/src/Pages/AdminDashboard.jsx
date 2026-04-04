import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, ShieldAlert, Trash2, 
  Search, Filter, ChevronRight, LayoutGrid,
  BarChart3, MessageSquare, Database,
  ArrowUpRight, ArrowDownRight, MoreVertical,
  Activity, GraduationCap, Building2,
  Lock, Unlock
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAdminStore from '../store/adminStore';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-gray-200 dark:border-white/[0.08] relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 blur-3xl rounded-full translate-x-12 -translate-y-12 transition-all group-hover:scale-150`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center text-current`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-[10px] font-black ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-widest">{value}</h3>
      <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  </motion.div>
);

const UserRow = ({ user, onBlock, onDelete }) => (
  <motion.tr 
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="border-b border-gray-100 dark:border-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
  >
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black uppercase text-xs">
          {user.name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{user.name}</div>
          <div className="text-[10px] text-gray-500 dark:text-slate-500 font-medium">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
      <div className="flex flex-col">
        <span>{user.university}</span>
        <span className="text-[8px] opacity-60">Sem {user.semester} · {user.branch}</span>
      </div>
    </td>
    <td className="py-4 px-6 border-none">
      <div className="flex items-center gap-4">
        <div className="text-center">
            <div className="text-xs font-black text-gray-900 dark:text-white">{user.publicRepoCount || 0}</div>
            <div className="text-[8px] text-slate-500 uppercase tracking-tighter">Public</div>
        </div>
        <div className="text-center">
            <div className="text-xs font-black text-gray-900 dark:text-white">{user.privateRepoCount || 0}</div>
            <div className="text-[8px] text-slate-500 uppercase tracking-tighter">Private</div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
        user.status === 'active' 
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      }`}>
        {user.status}
      </span>
    </td>
    <td className="py-4 px-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onBlock(user._id)}
          className={`p-2 rounded-xl border border-gray-100 dark:border-white/10 transition-all ${
            user.status === 'active' ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
          }`}
        >
          {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <button 
          onClick={() => onDelete(user._id)}
          className="p-2 rounded-xl border border-gray-100 dark:border-white/10 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </motion.tr>
);

const AdminDashboard = () => {
  const { users, fetchUsers, toggleUserBlock, deleteUser, loading } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* ── Header ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-600 uppercase">Control</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-500 font-medium">Manage users, monitor repository growth, and handle moderation.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20"
                />
             </div>
             <button className="p-3 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all shadow-sm">
                <Activity size={18} />
             </button>
          </div>
        </section>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Scholars" value={users.length} icon={Users} color="bg-violet-500" trend={12} />
          <StatCard label="Active Status" value={users.filter(u => u.status === 'active').length} icon={Shield} color="bg-emerald-500" trend={8} />
          <StatCard label="Blocked Users" value={users.filter(u => u.status === 'blocked').length} icon={ShieldAlert} color="bg-rose-500" trend={-15} />
          <StatCard label="System Health" value="99.9%" icon={LayoutGrid} color="bg-indigo-500" />
        </div>

        {/* ── User Table ── */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-[40px] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.02] text-slate-500 border-b border-gray-100 dark:border-white/[0.06]">
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">User Profile</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Institution Info</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Repository Metrics</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <UserRow 
                      key={user._id} 
                      user={user} 
                      onBlock={toggleUserBlock} 
                      onDelete={deleteUser} 
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {loading && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mb-4">
                  <Activity size={32} />
               </motion.div>
               <span className="text-xs font-bold uppercase tracking-widest">Syncing Global Data...</span>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
             <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Users size={32} className="mb-4 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest">No users found matching your criteria</span>
             </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;