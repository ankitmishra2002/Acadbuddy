import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Eye, Trash2, Share2, Sparkles, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { downloadAsMarkdown } from '../../utils/downloadUtils';
import { useToast } from '../../context/ToastContext';

const ContentList = ({ subjectId }) => {
  const toast = useToast();
  const [contents, setContents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sharingContent, setSharingContent] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContents();
    // Fetch user data if not available
    if (!user) {
      useAuthStore.getState().fetchUser();
    }
  }, [subjectId, filter, user]);

  const fetchContents = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await api.get(`/content/${subjectId}`, { params });
      // Ensure subjectId is set for each content item
      const contentsWithSubject = response.data.map(content => ({
        ...content,
        subjectId: content.subjectId || { _id: subjectId }
      }));
      setContents(contentsWithSubject);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.delete(`/content/${id}`);
      fetchContents();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const handleShareToCommunity = (content) => {
    setSharingContent(content);
    setShowShareModal(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!sharingContent) return;

    const form = e.target;
    const formData = new FormData(form);
    
    try {
      // Get form values
      const title = formData.get('title') || sharingContent.title;
      const subject = formData.get('subject') || sharingContent.subjectId?.name || 'Unknown';
      const topic = formData.get('topic') || sharingContent.topic;

      const postData = new FormData();
      postData.append('contentId', sharingContent._id);
      postData.append('type', sharingContent.type);
      postData.append('title', title);
      postData.append('content', JSON.stringify(sharingContent.content));
      
      const metadata = {
        subject: subject,
        topic: topic,
        semester: user?.semester || '',
        university: user?.university || '',
        branch: user?.branch || ''
      };
      postData.append('metadata', JSON.stringify(metadata));

      await api.post('/community/posts', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Content shared to community successfully.');
      setShowShareModal(false);
      setSharingContent(null);
    } catch (error) {
      toast.error('Failed to share content: ' + (error.response?.data?.message || error.message));
    }
  };

  const typeLabels = {
    notes: 'Study Notes',
    report: 'Report',
    ppt: 'PPT',
    revision_sheet: 'Revision Sheet',
    mock_paper: 'Mock Paper'
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">My Generated Content</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium whitespace-nowrap cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <option value="all">All Types</option>
          <option value="notes">Notes</option>
          <option value="report">Reports</option>
          <option value="ppt">PPT</option>
          <option value="revision_sheet">Revision Sheets</option>
          <option value="mock_paper">Mock Papers</option>
        </select>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
          <FileText size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No content generated yet. Create some using the tools above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <div 
              key={content._id} 
              className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800/50 transition-all cursor-pointer group flex flex-col h-full transform hover:-translate-y-1"
              onClick={() => navigate(`/content/${content._id}`)}
            >
              <div className="flex-1">
                <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50 mb-4 inline-block tracking-wide uppercase">
                  {typeLabels[content.type]}
                </span>
                <h3 className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">{content.title}</h3>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span> Topic: <span className="text-slate-800 dark:text-slate-300 truncate">{content.topic}</span>
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Created: {new Date(content.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Link
                  to={`/focus/${content.type}/${content._id}`}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  title="View in Focus Mode"
                >
                  <Eye size={18} /> View
                </Link>
                <div className="flex gap-1" >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAsMarkdown(content.content, content.title);
                    }}
                    className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    title="Download Markdown"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleShareToCommunity(content)}
                    className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    title="Share to Community"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(content._id)}
                    className="text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share to Community Modal */}
      {showShareModal && sharingContent && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 p-2 rounded-xl">
                <Share2 size={24} />
              </span>
              Share to Community
            </h2>
            <form onSubmit={handleShareSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={sharingContent.title}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  readOnly
                  defaultValue={sharingContent.subjectId?.name || ''}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  required
                  defaultValue={sharingContent.topic}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="flex gap-4 pt-4 mt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setSharingContent(null);
                  }}
                  className="flex-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Share Publicly
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ContentList;

