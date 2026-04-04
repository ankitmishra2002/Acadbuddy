import { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Eye, Plus, X, ArrowLeft, Cloud, Loader2, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({
    university: '',
    branch: '',
    semester: '',
    subject: '',
    type: ''
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    type: 'notes',
    subject: '',
    topic: '',
    semester: user?.semester || '',
    university: user?.university || '',
    branch: user?.branch || '',
    file: null,
    content: '',
    cloudinaryUrl: null,
    cloudinaryPublicId: null
  });
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (isAuthenticated && !user) {
      useAuthStore.getState().fetchUser();
    }
  }, [filters, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        semester: user.semester || prev.semester,
        university: user.university || prev.university,
        branch: user.branch || prev.branch
      }));
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const res = await api.get('/community/posts', { params });
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = {
    notes: 'Study Notes',
    report: 'Report',
    ppt: 'PPT',
    revision_sheet: 'Revision Sheet',
    mock_paper: 'Mock Paper'
  };

  const handleCloudinaryUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    
    setUploadingToCloudinary(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', fileToUpload);
      
      const response = await api.post('/cloudinary/upload', formDataToSend);
      
      setFormData(prev => ({
        ...prev,
        cloudinaryUrl: response.data.url,
        cloudinaryPublicId: response.data.public_id
      }));
      alert('File uploaded to Cloudinary successfully!');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      alert('Failed to upload file to Cloudinary. You can still upload directly.');
    } finally {
      setUploadingToCloudinary(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.title || !formData.subject || !formData.topic || !formData.semester) {
        alert('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      fd.append('type', formData.type);
      fd.append('title', formData.title);

      if (formData.cloudinaryUrl) {
        fd.append('content', `[Cloudinary File]\nURL: ${formData.cloudinaryUrl}\nPublic ID: ${formData.cloudinaryPublicId}`);
      } else if (formData.file) {
        fd.append('file', formData.file);
      } else {
        fd.append('content', formData.content);
      }

      fd.append(
        'metadata',
        JSON.stringify({
          subject: formData.subject,
          topic: formData.topic,
          semester: parseInt(formData.semester),
          university: formData.university,
          branch: formData.branch
        })
      );

      await api.post('/community/posts', fd);
      
      setShowCreateModal(false);
      setFormData({
        title: '',
        type: 'notes',
        subject: '',
        topic: '',
        semester: user?.semester || '',
        university: user?.university || '',
        branch: user?.branch || '',
        file: null,
        content: '',
        cloudinaryUrl: null,
        cloudinaryPublicId: null
      });
      fetchPosts();
    } catch (e) {
      console.error('Create post error:', e);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/community/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error('Delete post error:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

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
      className="space-y-6 sm:space-y-8 w-full pb-8"
    >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tighter pb-1 drop-shadow-sm">Community</h1>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors mt-2"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} /> Create Post
            </button>
          )}
        </motion.div>

        {/* Filter Bar */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-200">
            <Filter size={18} />
            <h3 className="font-bold text-lg">Filter Community</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {['University', 'Branch', 'Semester', 'Subject'].map((label) => (
              <div key={label} className="relative">
                <input
                  placeholder={label}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400"
                  value={filters[label.toLowerCase()] || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, [label.toLowerCase()]: e.target.value })
                  }
                />
              </div>
            ))}
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100 appearance-none"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Feed */}
        <motion.div variants={itemVariants}>
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
             </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No posts found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">Try adjusting your filters or be the first to share your notes with the community!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map((post) => {
                const postUserId = post.userId?._id || post.userId;
                const currentUserId = user?.id || user?._id;
                const isOwner = user && postUserId && postUserId.toString() === currentUserId?.toString();
                
                return (
                  <motion.div
                    variants={itemVariants}
                    key={post._id}
                    className="bg-white dark:bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-white dark:border-slate-800 p-6 sm:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col h-full relative"
                  >
                    <Link
                      to={`/community/${post._id}`}
                      className="flex-grow flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                          {typeLabels[post.type]}
                        </span>
                        
                        <div className="flex items-center gap-2">
                           <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Eye size={14} /> {post.viewCount}
                          </span>
                          {isOwner && (
                            <button
                              onClick={(e) => handleDeletePost(post._id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all z-10"
                              title="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-xl sm:text-2xl text-slate-800 dark:text-slate-100 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 mb-3 truncate">
                        <span className="text-slate-600">{post.metadata.university}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-600">{post.metadata.branch}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-600">Sem {post.metadata.semester}</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 mb-5 mt-auto">
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <BookOpen size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="font-medium text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{post.metadata.subject}</span>
                            <span className="mx-1.5 text-slate-300">|</span>
                            {post.metadata.topic}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
                          <ThumbsUp size={18} /> 
                          <span>{post.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 transition-colors">
                          <MessageCircle size={18} /> 
                          <span>Discuss</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      {/* Create Modal Overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white border-opacity-50 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Plus size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Share with Community</h2>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      title: '',
                      type: 'notes',
                      subject: '',
                      topic: '',
                      semester: user?.semester || '',
                      university: user?.university || '',
                      branch: user?.branch || '',
                      file: null,
                      content: '',
                      cloudinaryUrl: null,
                      cloudinaryPublicId: null
                    });
                  }}
                  className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Post Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Complete DSA Unit 2 Notes"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Database Systems"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Topic <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="e.g. Normalization Forms"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Material Type <span className="text-rose-500">*</span>
                   </label>
                   <select
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-800 dark:text-slate-100 appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Upload Associated File <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="file"
                        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov,.mkv,.webm,.mp3,.wav,.m4v"
                        onChange={(e) => {
                          const selectedFile = e.target.files[0];
                          if (selectedFile) {
                            setFormData(prev => ({
                              ...prev,
                              file: selectedFile,
                              cloudinaryUrl: null,
                              cloudinaryPublicId: null
                            }));
                          }
                        }}
                        className="flex-1 block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none"
                      />
                      {formData.file && (
                        <button
                          type="button"
                          onClick={() => handleCloudinaryUpload(formData.file)}
                          disabled={uploadingToCloudinary}
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:-translate-y-0.5"
                        >
                          {uploadingToCloudinary ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Cloud size={18} />
                              Cloud Upload
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {formData.cloudinaryUrl && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                            <Check size={16} className="bg-emerald-200 rounded-full p-0.5 text-emerald-800" /> 
                            File successfully hosted on Cloudinary
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const isPDF = formData.cloudinaryUrl.toLowerCase().includes('.pdf') || formData.cloudinaryUrl.includes('format=pdf');
                              if (isPDF) {
                                window.open(formData.cloudinaryUrl, '_blank');
                              } else {
                                window.open(formData.cloudinaryUrl, '_blank');
                              }
                            }}
                            className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Eye size={14} /> View File
                          </button>
                        </div>
                        {formData.file && formData.file.type === 'application/pdf' && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-emerald-200 shadow-inner">
                            <iframe
                              src={formData.cloudinaryUrl}
                              className="w-full h-48 bg-white"
                              title="PDF Preview"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {formData.file && !formData.cloudinaryUrl && (
                      <p className="text-sm font-medium text-slate-500 bg-white inline-block px-3 py-1.5 rounded-lg border border-slate-200">
                        Selected: <span className="text-slate-800">{formData.file.name}</span> <span className="text-slate-400">({(formData.file.size / 1024).toFixed(2)} KB)</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Direct Content Entry <span className="text-slate-400 font-normal ml-1">{formData.cloudinaryUrl || formData.file ? '(Optional if file uploaded)' : ''}</span>
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Provide additional details, text context, or link references here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium text-slate-800 resize-y"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  {(!formData.cloudinaryUrl && !formData.file && !formData.content) && (
                    <p className="text-xs font-semibold text-rose-500 w-full mb-2 sm:mb-0">
                      * Please upload a file via Cloudinary or enter manual content above.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || (!formData.cloudinaryUrl && !formData.file && !formData.content)}
                    className="w-full sm:w-auto ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 font-bold transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Publishing...
                      </span>
                    ) : 'Publish to Community'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Community;
