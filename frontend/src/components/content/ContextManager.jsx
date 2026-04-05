import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, FileText, X, Cloud, Loader2, Eye, Download, Share2 } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ContextManager = ({ subjectId }) => {
  const navigate = useNavigate();
  const [contexts, setContexts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'syllabus',
    title: '',
    content: '',
    topic: '',
    keywords: ''
  });
  const [file, setFile] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(null);
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);

  useEffect(() => {
    fetchContexts();
  }, [subjectId]);

  const fetchContexts = async () => {
    try {
      const response = await api.get(`/context/${subjectId}`);
      setContexts(response.data);
    } catch (error) {
      console.error('Failed to fetch contexts:', error);
    }
  };

  const handleCloudinaryUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    
    setUploadingToCloudinary(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', fileToUpload);
      
      const response = await api.post('/cloudinary/upload', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setCloudinaryUrl(response.data.url);
      setCloudinaryPublicId(response.data.public_id);
      alert('File uploaded to Cloudinary successfully!');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      alert('Failed to upload file to Cloudinary. You can still upload directly.');
    } finally {
      setUploadingToCloudinary(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subjectId', subjectId);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      
      // If Cloudinary URL exists, use it; otherwise use direct file upload or content
      if (cloudinaryUrl) {
        // Send Cloudinary URL in a format the backend can parse
        formDataToSend.append('content', `[Cloudinary File]\nURL: ${cloudinaryUrl}\nPublic ID: ${cloudinaryPublicId}`);
      } else if (file) {
        formDataToSend.append('file', file);
      } else {
        formDataToSend.append('content', formData.content);
      }
      
      formDataToSend.append('topic', formData.topic);
      formDataToSend.append('keywords', formData.keywords);

      await api.post('/context', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setFormData({ type: 'syllabus', title: '', content: '', topic: '', keywords: '' });
      setFile(null);
      setCloudinaryUrl(null);
      setCloudinaryPublicId(null);
      fetchContexts();
    } catch (error) {
      console.error('Upload error:', error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload context';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this context?')) return;
    try {
      await api.delete(`/context/${id}`);
      fetchContexts();
    } catch (error) {
      alert('Failed to delete context');
    }
  };

  const handleViewFile = (context) => {
    let fileUrl = null;
    
    // Extract URL from context
    if (context.fileUrl && context.fileUrl.startsWith('http')) {
      fileUrl = context.fileUrl;
    } else if (context.content && context.content.startsWith('http')) {
      fileUrl = context.content;
    } else if (context.content && context.content.includes('[Cloudinary File]')) {
      // Extract Cloudinary URL from content string
      const urlMatch = context.content.match(/URL:\s*(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        fileUrl = urlMatch[1];
      }
    }
    
    if (fileUrl) {
      // Check if it's a PDF - Cloudinary raw files need special handling
      const isPDF = fileUrl.toLowerCase().includes('.pdf') || 
                   fileUrl.includes('format=pdf') || 
                   fileUrl.includes('resource_type=raw') ||
                   (context.content && context.content.toLowerCase().includes('pdf'));
      
      if (isPDF) {
        // For PDFs, try to open in new tab with proper viewer
        // Cloudinary raw files can be viewed directly
        window.open(fileUrl, '_blank');
      } else {
        // For other files, open directly
        window.open(fileUrl, '_blank');
      }
    } else {
      // Show content in a modal or new page
      alert('File content:\n\n' + context.content.substring(0, 500) + (context.content.length > 500 ? '...' : ''));
    }
  };

  const handleShareToCommunity = async (context) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', context.type === 'notes' ? 'notes' : 'notes');
      formDataToSend.append('title', context.title);
      
      // If context has a file URL, use it
      if (context.fileUrl) {
        formDataToSend.append('content', `[Cloudinary File]\nURL: ${context.fileUrl}`);
      } else {
        formDataToSend.append('content', context.content);
      }

      // Get user info for metadata
      const userResponse = await api.get('/auth/me');
      const user = userResponse.data;

      formDataToSend.append(
        'metadata',
        JSON.stringify({
          subject: 'Shared from Context',
          topic: context.metadata?.topic || context.title,
          semester: user.semester || 1,
          university: user.university || '',
          branch: user.branch || ''
        })
      );

      await api.post('/community/posts', formDataToSend);
      alert('Context shared to community successfully!');
      navigate('/community');
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share to community. Please try again.');
    }
  };

  const typeLabels = {
    syllabus: 'Syllabus',
    pyq: 'Past Year Questions',
    notes: 'Notes',
    reference: 'Reference Material'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Context Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
        >
          <Upload size={18} />
          Upload Context
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contexts.map((context) => (
          <div key={context._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                  {typeLabels[context.type]}
                </span>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-2.5 leading-tight">{context.title}</h3>
              </div>
              <button
                onClick={() => handleDelete(context._id)}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete Context"
              >
                <X size={18} />
              </button>
            </div>
            {context.metadata?.topic && (
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1 line-clamp-1">Topic: {context.metadata.topic}</p>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 mb-6 flex-grow line-clamp-3 leading-relaxed">
              {context.fileUrl ? '📎 File attached' : context.content}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 w-full">
              {(context.fileUrl || (context.content && context.content.startsWith('http'))) && (
                <button
                  onClick={() => handleViewFile(context)}
                  className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 px-3 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Eye size={14} />
                  View
                </button>
              )}
              {(context.fileUrl || (context.content && context.content.startsWith('http'))) && (
                <a
                  href={context.fileUrl || context.content}
                  download
                  className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/40 px-3 py-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Download size={14} />
                  Download
                </a>
              )}
              <button
                onClick={() => handleShareToCommunity(context)}
                className="flex flex-1 sm:flex-none justify-center items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/40 px-3 py-2 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors sm:ml-auto"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-7 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar my-auto">
            <h2 className="text-2xl font-extrabold mb-6 text-slate-800 dark:text-slate-100 tracking-tight">Upload Context</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
                >
                  <option value="syllabus" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Syllabus</option>
                  <option value="pyq" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Past Year Questions</option>
                  <option value="notes" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Notes</option>
                  <option value="reference" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Reference Material</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Midterm Syllabus 2024"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Upload File <span className="text-slate-400 font-normal ml-1">(PDF/Images/Videos)</span>
                </label>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov,.mkv,.webm,.mp3,.wav,.m4v"
                      onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          setCloudinaryUrl(null);
                          setCloudinaryPublicId(null);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 transition-all cursor-pointer shadow-sm"
                    />
                    {file && (
                      <button
                        type="button"
                        onClick={() => handleCloudinaryUpload(file)}
                        disabled={uploadingToCloudinary}
                        className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all w-full sm:w-auto"
                      >
                        {uploadingToCloudinary ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Cloud size={18} />
                            Upload to Cloud
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {cloudinaryUrl && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          File uploaded successfully
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const isPDF = file && file.type === 'application/pdf';
                            const isVideo = file && file.type.startsWith('video/');
                            
                            if (isPDF) {
                              window.open(cloudinaryUrl, '_blank');
                            } else if (isVideo) {
                              window.open(cloudinaryUrl, '_blank');
                            } else {
                              window.open(cloudinaryUrl, '_blank');
                            }
                          }}
                          className="px-4 py-1.5 bg-emerald-600 dark:bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 flex items-center gap-1 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </div>
                      {file && file.type === 'application/pdf' && (
                        <div className="mt-3">
                          <div className="w-full h-64 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-inner">
                            <iframe
                              src={`${cloudinaryUrl}#toolbar=0`}
                              className="w-full h-full"
                              title="PDF Preview"
                              onError={(e) => {
                                e.target.parentElement.innerHTML = `
                                  <div class="p-4 text-center text-slate-600 dark:text-slate-400 h-full flex flex-col items-center justify-center">
                                    <p class="font-medium">PDF preview not available. Click "View" to open.</p>
                                    <a href="${cloudinaryUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 font-bold hover:underline mt-2">
                                      Open PDF
                                    </a>
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {file && file.type.startsWith('video/') && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
                          <video
                            src={cloudinaryUrl}
                            controls
                            className="w-full max-h-64 object-contain bg-black"
                            title="Video Preview"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                  {file && !cloudinaryUrl && (
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 mt-2">
                      File selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Content <span className="text-slate-400 font-normal ml-1">(if not uploading file)</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 resize-y"
                  placeholder="Paste text, notes, or raw content here..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                  Topic <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="E.g., Quantum Mechanics"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all sm:order-2"
                >
                  Confirm Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFile(null);
                    setCloudinaryUrl(null);
                    setCloudinaryPublicId(null);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-all sm:order-1"
                >
                  Cancel
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

export default ContextManager;

