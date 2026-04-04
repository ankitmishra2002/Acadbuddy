import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, 
  MessageCircle, Share2, Send,
  User as UserIcon, Clock, BookOpen,
  MoreVertical, Shield, Download,
  ExternalLink, MessageSquare, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useCommunityStore from '../store/communityStore';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

const Comment = ({ comment }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-4 p-4 rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"
  >
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center text-violet-500 font-black text-xs uppercase">
       {comment.userId?.name?.charAt(0) || 'U'}
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{comment.userId?.name || 'Anonymous'}</h5>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {(() => {
                try {
                    return `${formatDistanceToNow(new Date(comment.createdAt))} ago`;
                } catch(e) {
                    return 'Recent';
                }
            })()}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
    </div>
  </motion.div>
);

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPostById, fetchComments, addComment, votePost, loading } = useCommunityStore();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flattenAIContent = (data) => {
    if (!data) return "No content available.";
    if (typeof data === 'string') return data;
    
    let md = "";
    if (data.sections && Array.isArray(data.sections)) {
        if (data.title) md += `# ${data.title}\n\n`;
        data.sections.forEach(s => {
            md += `## ${s.title}\n${s.content}\n\n`;
        });
        if (data.references && Array.isArray(data.references)) {
            md += `### References\n${data.references.map(r => `- ${r}`).join('\n')}\n`;
        }
    } 
    else if (data.slides && Array.isArray(data.slides)) {
        if (data.title) md += `# ${data.title}\n\n`;
        data.slides.forEach(s => {
            md += `---\n\n## Slide ${s.slideNumber}: ${s.title}\n${s.content}\n\n${s.notes ? `_Notes: ${s.notes}_` : ''}\n\n`;
        });
    }
    else {
        md = JSON.stringify(data, null, 2);
    }
    return md;
  };

  const mdContent = flattenAIContent(post?.content);

  const safeFormatDate = (date) => {
    try {
        if (!date) return 'Recent';
        return `${formatDistanceToNow(new Date(date))} ago`;
    } catch (e) {
        return 'Recent';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const postData = await fetchPostById(id);
      if (postData) {
        setPost(postData);
        const commentData = await fetchComments(id);
        setComments(commentData);
      }
    };
    loadData();
  }, [id]);

  const handleVote = async (type) => {
    const success = await votePost(id, type);
    if (success) {
      // Reload post to update counts
      const updatedPost = await fetchPostById(id);
      setPost(updatedPost);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await addComment(id, newComment);
    if (result.success) {
      setComments([result.comment, ...comments]);
      setNewComment('');
      // Update local post comment count
      setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
    }
    setIsSubmitting(false);
  };

  if (loading && !post) return (
    <DashboardLayout>
       <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Retrieving Post...</span>
       </div>
    </DashboardLayout>
  );

  if (!post) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── Navigation ── */}
        <button 
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-500 transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Community
        </button>

        {/* ── Main Post ── */}
        <article className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-none">
           {/* Author Header */}
           <div className="p-8 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl uppercase shadow-lg shadow-violet-500/20">
                    {post.userId?.name?.charAt(0) || 'U'}
                 </div>
                 <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                        {post.userId?.name || 'Anonymous User'}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>{post.userId?.university || 'University'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span>{safeFormatDate(post.createdAt)}</span>
                    </div>
                 </div>
              </div>
              <button className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                 <MoreVertical size={20} />
              </button>
           </div>

           {/* Content Body */}
           <div className="p-8 md:p-12 space-y-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-violet-500/10 text-violet-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        {post.type}
                    </span>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        Sem {post.metadata?.semester}
                    </span>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    {post.title}
                 </h2>
                 <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10">
                        <BookOpen size={14} className="text-violet-500" />
                        <span>{post.metadata?.subject}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10">
                        <Shield size={14} className="text-emerald-500" />
                        <span>{post.metadata?.topic}</span>
                    </div>
                 </div>
              </div>

              {/* Resource Content Section */}
              <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.08] rounded-[32px] p-8 md:p-12">
                 <div className="prose prose-slate dark:prose-invert prose-violet max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight
                    dark:prose-p:text-slate-300 dark:prose-li:text-slate-300
                    prose-p:leading-relaxed prose-li:leading-relaxed
                    prose-strong:text-violet-600 dark:prose-strong:text-violet-400">
                    <ReactMarkdown>
                        {mdContent || "No detailed content available for this resource."}
                    </ReactMarkdown>
                 </div>
              </div>

              {/* Interactions Footer */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/[0.06]">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/[0.08]">
                       <button 
                         onClick={() => handleVote('upvote')} 
                         className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all uppercase tracking-widest"
                       >
                         <ThumbsUp size={18} /> {post.upvotes || 0}
                       </button>
                       <div className="w-[1px] h-4 bg-gray-200 dark:bg-white/10" />
                       <button 
                         onClick={() => handleVote('downvote')} 
                         className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all uppercase tracking-widest"
                       >
                         <ThumbsDown size={18} /> {post.downvotes || 0}
                       </button>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                       <MessageCircle size={18} />
                       <span className="text-xs font-black uppercase tracking-widest">{post.commentCount || 0} Comments</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all">
                    <Share2 size={16} /> Share Post
                 </button>
              </div>
           </div>
        </article>

        {/* ── Comments Section ── */}
        <section className="space-y-6">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
              Discussion Hub <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/[0.06]" />
           </h3>

           {/* Comment Form */}
           <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-[32px] p-2 flex items-center gap-2 shadow-xl shadow-black/5 dark:shadow-none focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black uppercase ml-1">
                 {user?.name?.charAt(0) || 'U'}
              </div>
              <input 
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Share your thoughts or ask a question..."
                 className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-4 py-3 dark:text-white placeholder:text-slate-500"
              />
              <button 
                 onClick={handleAddComment}
                 disabled={!newComment.trim() || isSubmitting}
                 className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                 {isSubmitting ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
           </div>

           {/* Comment List */}
           <div className="space-y-4">
              {comments.map((comment) => (
                 <Comment key={comment._id} comment={comment} />
              ))}
              
              {comments.length === 0 && (
                 <div className="text-center py-20 bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-[40px]">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                       <MessageSquare size={24} />
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Be the first to start the conversation!</p>
                 </div>
              )}
           </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default PostDetail;