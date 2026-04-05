import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Database, Globe, Search, RefreshCw, AlertCircle, ShieldAlert,
  Trash2, Ban, CheckCircle, Eye, EyeOff, FileText, BarChart3, Layout,
  LogOut, ChevronDown, BookOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

/* ─── Confirm Modal ─────────────────────────────────────────────────────── */
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, danger = true }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-xl font-semibold text-white transition ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ icon, title, value, sub, color }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-start gap-4 relative overflow-hidden"
  >
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers]         = useState([]);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [searchPost, setSearchPost] = useState('');
  const [confirm, setConfirm]     = useState(null); // {type, id, label, action}

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  /* ── Fetch Users ── */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Unable to load users. Check admin privileges and backend connection.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch Posts ── */
  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await api.get('/admin/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); fetchPosts(); }, []);

  /* ── User Actions ── */
  const handleBlockUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      setUsers(prev =>
        prev.map(u => u._id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u)
      );
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  /* ── Post Actions ── */
  const handleBlockPost = async (id) => {
    try {
      await api.put(`/admin/posts/${id}/block`);
      setPosts(prev =>
        prev.map(p => p._id === id ? { ...p, status: p.status === 'hidden' ? 'active' : 'hidden' } : p)
      );
    } catch (err) {
      toast.error('Failed to update post status.');
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  /* ── Confirm helper ── */
  const ask = (type, id, label) => setConfirm({ type, id, label });
  const handleConfirm = async () => {
    if (!confirm) return;
    const { type, id } = confirm;
    if (type === 'deleteUser')  await handleDeleteUser(id);
    if (type === 'blockUser')   await handleBlockUser(id);
    if (type === 'deletePost')  await handleDeletePost(id);
    if (type === 'blockPost')   await handleBlockPost(id);
    setConfirm(null);
  };

  /* ── Derived / Chart Data ── */
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.university.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(searchPost.toLowerCase()) ||
    p.userId?.name?.toLowerCase().includes(searchPost.toLowerCase())
  );

  // University Distribution (Pie)
  const uniMap = {};
  users.forEach(u => { uniMap[u.university] = (uniMap[u.university] || 0) + 1; });
  const uniData = Object.entries(uniMap).map(([name, value]) => ({ name, value }));

  // Public vs Private (Bar)
  const repoBarData = users.slice(0, 10).map(u => ({
    name: u.name.split(' ')[0],
    public: u.publicRepoCount,
    private: u.privateRepoCount
  }));

  // Fake registrations over time (Area)
  const registrationData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return months.slice(0, now.getMonth() + 1).map((m, i) => ({
      month: m,
      users: Math.max(2, users.filter(u => new Date(u.createdAt).getMonth() === i).length)
    }));
  })();

  const totalPublic  = users.reduce((a, u) => a + u.publicRepoCount, 0);
  const totalPrivate = users.reduce((a, u) => a + u.privateRepoCount, 0);
  const blocked = users.filter(u => u.status === 'blocked').length;

  const TABS = [
    { id: 'overview',  label: 'Overview',          icon: BarChart3 },
    { id: 'users',     label: 'User Management',   icon: Users },
    { id: 'posts',     label: 'Post Moderation',   icon: FileText },
  ];

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f6f8fb] flex flex-col">
      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-300/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm leading-none">Admin Control Panel</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">AcadBuddy</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              <Layout size={15} /> User Dashboard
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 space-y-8">

        {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard icon={<Users className="w-5 h-5 text-indigo-600" />} title="Total Users" value={users.length} sub={`${blocked} blocked`} color="bg-indigo-50" />
              <StatCard icon={<Globe className="w-5 h-5 text-emerald-600" />} title="Public Posts" value={totalPublic} sub="Community content" color="bg-emerald-50" />
              <StatCard icon={<Database className="w-5 h-5 text-amber-600" />} title="Generated Content" value={totalPrivate} sub="Private repos" color="bg-amber-50" />
              <StatCard icon={<FileText className="w-5 h-5 text-rose-600" />} title="Community Posts" value={posts.length} sub={`${posts.filter(p=>p.status==='hidden').length} hidden`} color="bg-rose-50" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Area Chart — Registrations */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-1">User Registrations Over Time</h3>
                <p className="text-xs text-gray-400 mb-5">Monthly breakdown of new signups this year</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={registrationData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fill="url(#uGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart — University Distribution */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-1">University Distribution</h3>
                <p className="text-xs text-gray-400 mb-5">Users grouped by university affiliation</p>
                {uniData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={uniData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {uniData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                    No user data to display
                  </div>
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-1">Public vs Private Repositories per User</h3>
              <p className="text-xs text-gray-400 mb-5">Top 10 users by content generation</p>
              {repoBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={repoBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="public"  name="Public Posts"  fill="#10b981" radius={[6,6,0,0]} />
                    <Bar dataKey="private" name="Private Content" fill="#6366f1" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
                  No repository data yet
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══ USERS TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="font-bold text-gray-900">All Registered Users</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={fetchUsers}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {error ? (
                <div className="p-12 flex flex-col items-center text-red-500 gap-3">
                  <AlertCircle className="w-10 h-10" />
                  <p className="text-center font-medium">{error}</p>
                </div>
              ) : loading ? (
                <div className="p-12 flex justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] uppercase tracking-widest text-gray-400">
                        <th className="px-5 py-3.5 font-semibold">User</th>
                        <th className="px-5 py-3.5 font-semibold">Academic Info</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Role</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Public</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Private</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                          <motion.tr
                            key={u._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${u.status === 'blocked' ? 'opacity-60' : ''}`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-gray-700">{u.university}</p>
                              <p className="text-xs text-gray-400">{u.branch} • Sem {u.semester}</p>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                              }`}>{(u.role || 'user').toUpperCase()}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                u.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                              }`}>{u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">{u.publicRepoCount}</span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm">{u.privateRepoCount}</span>
                            </td>
                            <td className="px-5 py-4">
                              {u.role !== 'admin' && (
                                <div className="flex items-center justify-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => ask('blockUser', u._id, u.status === 'blocked' ? `Unblock ${u.name}?` : `Block ${u.name}?`)}
                                    title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                                    className={`p-2 rounded-lg transition ${
                                      u.status === 'blocked'
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                    }`}
                                  >
                                    {u.status === 'blocked' ? <CheckCircle size={15} /> : <Ban size={15} />}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={() => ask('deleteUser', u._id, `Delete ${u.name} and all their content?`)}
                                    title="Delete User"
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                  >
                                    <Trash2 size={15} />
                                  </motion.button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                              {searchUser ? 'No users found matching your search.' : 'No users registered yet.'}
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══ POSTS TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'posts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <h2 className="font-bold text-gray-900">Community Post Moderation</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchPost}
                    onChange={e => setSearchPost(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={fetchPosts}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {postsLoading ? (
                <div className="p-12 flex justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] uppercase tracking-widest text-gray-400">
                        <th className="px-5 py-3.5 font-semibold">Post Title</th>
                        <th className="px-5 py-3.5 font-semibold">Author</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Type</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Votes</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Date</th>
                        <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredPosts.length > 0 ? filteredPosts.map((p, i) => (
                          <motion.tr
                            key={p._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${p.status === 'hidden' ? 'opacity-50' : ''}`}
                          >
                            <td className="px-5 py-4 max-w-[200px]">
                              <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                              <p className="text-xs text-gray-400 truncate">{p.metadata?.subject}</p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-gray-700">{p.userId?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{p.userId?.email || ''}</p>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full capitalize">
                                {p.type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                p.status === 'hidden' ? 'bg-red-100 text-red-600'
                                : p.status === 'reported' ? 'bg-amber-100 text-amber-600'
                                : 'bg-emerald-100 text-emerald-700'
                              }`}>{(p.status || 'active').toUpperCase()}</span>
                            </td>
                            <td className="px-5 py-4 text-center text-sm text-gray-600 font-medium">
                              ↑{p.upvotes || 0} / ↓{p.downvotes || 0}
                            </td>
                            <td className="px-5 py-4 text-center text-xs text-gray-400">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => ask('blockPost', p._id, p.status === 'hidden' ? `Unhide post "${p.title}"?` : `Hide post "${p.title}"?`)}
                                  title={p.status === 'hidden' ? 'Unhide Post' : 'Hide Post'}
                                  className={`p-2 rounded-lg transition ${
                                    p.status === 'hidden'
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  }`}
                                >
                                  {p.status === 'hidden' ? <Eye size={15} /> : <EyeOff size={15} />}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={() => ask('deletePost', p._id, `Permanently delete post "${p.title}"?`)}
                                  title="Delete Post"
                                  className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={15} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                              {searchPost ? 'No posts found.' : 'No community posts exist yet.'}
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={!!confirm}
        title="Are you sure?"
        message={confirm?.label}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
        danger={confirm?.type?.includes('delete')}
      />
    </div>
  );
};

export default AdminDashboard;
