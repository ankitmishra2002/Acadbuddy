import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, 
  Share2, Search, Filter, Plus, 
  User as UserIcon, Clock, BookOpen,
  X, Send, Sparkles, GraduationCap,
  ChevronRight, MessageCircle, MoreVertical
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useCommunityStore from '../store/communityStore';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
const PostCard = ({ post, onVote }) => {
  const formattedDate = () => {
    try {
        if (!post.createdAt) return 'Recent';
        return `${formatDistanceToNow(new Date(post.createdAt))} ago`;
    } catch (e) {
        return 'Recent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:bg-white/[0.06] transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-violet-500/20 uppercase">
            {post.userId?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h4 className="text-gray-900 dark:text-white font-black text-sm tracking-tight">{post.userId?.name || 'Anonymous User'}</h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              <span>{post.userId?.university || post.metadata?.university || 'University'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{formattedDate()}</span>
            </div>
          </div>
        </div>
        <button className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-500 text-[10px] font-black uppercase tracking-wider">
            {post.type || 'resource'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
            Sem {post.metadata?.semester || '1'}
          </span>
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-violet-500 transition-colors">
          {post.title || 'Untitled Resource'}
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
          {post.metadata?.topic || 'General Topic'} — shared for {post.metadata?.subject || 'Academics'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-white/[0.04] rounded-2xl border border-gray-200 dark:border-white/[0.08]">
            <button 
              onClick={() => onVote(post._id, 'upvote')}
              className="p-1.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <ThumbsUp size={16} />
              {post.upvotes}
            </button>
            <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10 mx-0.5" />
            <button 
              onClick={() => onVote(post._id, 'downvote')}
              className="p-1.5 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-bold text-xs flex items-center gap-1.5"
            >
              <ThumbsDown size={16} />
              {post.downvotes}
            </button>
          </div>
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-2xl text-gray-500 dark:text-slate-400 transition-all">
            <MessageCircle size={18} />
            <span className="text-xs font-bold">{post.commentCount || 0}</span>
          </button>
        </div>
        
        <button className="p-2.5 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
          <Share2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const Community = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, votePost, loading } = useCommunityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.metadata?.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.metadata?.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-10">
        
        {/* ── Header ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Community <span className="text-violet-500">Hub</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium tracking-wide">
              Connect with fellow students and share your curated study materials.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button className="p-3 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-2xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
              <Filter size={18} />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-violet-600 text-white font-black text-sm rounded-2xl flex items-center gap-2.5 shadow-lg shadow-violet-500/30 whitespace-nowrap"
            >
              <Plus size={18} />
              Share Resource
            </motion.button>
          </div>
        </section>

        {/* ── Posts Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredPosts.map((post, i) => (
              <PostCard key={post._id} post={post} onVote={votePost} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Empty State ── */}
        {filteredPosts.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white/50 dark:bg-white/[0.02] rounded-[40px] border-2 border-dashed border-gray-200 dark:border-white/[0.06] backdrop-blur-md"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Community Silence</h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">Be the first to share a study resource with your branch!</p>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Community;