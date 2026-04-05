import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, Copy, Eye, FileText, Download } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { downloadAsMarkdown } from '../utils/downloadUtils';
import { resolveSlideBullets, resolveSpeakerNotes } from '../utils/pptSlideUtils';
import { useToast } from '../context/ToastContext';

const PostDetail = () => {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (isAuthenticated) {
      fetchSubjects();
    }
  }, [id, isAuthenticated]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
      if (response.data.length > 0) {
        setSubjectId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await api.get(`/community/posts/${id}`);
      const postData = response.data;
      
      // Parse content if it's a string
      if (typeof postData.content === 'string') {
        try {
          postData.content = JSON.parse(postData.content);
        } catch (e) {
          // If parsing fails, try to extract JSON from the string
          const jsonMatch = postData.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              postData.content = JSON.parse(jsonMatch[0]);
            } catch (e2) {
              console.error('Failed to parse content:', e2);
            }
          }
        }
      }
      
      setPost(postData);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/community/posts/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/community/posts/${id}/vote`, { voteType });
      fetchPost();
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/community/posts/${id}/comment`, { content: commentText });
      setCommentText('');
      fetchComments();
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleClone = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/community/posts/${id}/clone`, { subjectId });
      setShowCloneModal(false);
      toast.success('Content cloned to your workspace.');
      navigate(`/subjects/${subjectId}`);
    } catch (error) {
      toast.error('Failed to clone content');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-12">Post not found</div>;
  }

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link
        to="/community"
        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Back to Community
      </Link>

      <div className="bg-white dark:bg-slate-900/80 p-6 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
          <div className="mb-8">
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-800">
              {post.type.replace('_', ' ')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-5 mb-3 text-slate-800 dark:text-white tracking-tight leading-tight">{post.title}</h1>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              {post.metadata?.university} • {post.metadata?.branch} • Semester {post.metadata?.semester}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {post.metadata?.subject} • {post.metadata?.topic}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/60">
            <button
              onClick={() => handleVote('upvote')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold transition-colors"
            >
              <ThumbsUp size={18} />
              {post.upvotes}
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 font-bold transition-colors"
            >
              <ThumbsDown size={18} />
              {post.downvotes}
            </button>
            <button
              onClick={() => downloadAsMarkdown(post.content, post.title)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 dark:bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-bold hover:shadow-lg hover:shadow-amber-500/30 border border-transparent transition-all ml-auto sm:ml-0"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setShowCloneModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold hover:shadow-lg hover:shadow-blue-500/30 border border-transparent transition-all"
              >
                <Copy size={18} />
                <span className="hidden sm:inline">Clone to Workspace</span>
                <span className="sm:hidden">Clone</span>
              </button>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            {(() => {
              // Ensure content is an object
              let content = post.content;
              if (typeof content === 'string') {
                // Check if it's a Cloudinary file URL
                if (content.includes('[Cloudinary File]')) {
                  const urlMatch = content.match(/URL:\s*(https?:\/\/[^\s]+)/);
                  const publicIdMatch = content.match(/Public ID:\s*([^\s]+)/);
                  if (urlMatch) {
                    const fileUrl = urlMatch[1];
                    // Check if it's a PDF - Cloudinary raw files or URLs with .pdf
                    const isPDF = fileUrl.toLowerCase().includes('.pdf') || 
                                 fileUrl.includes('format=pdf') || 
                                 fileUrl.includes('resource_type=raw') ||
                                 (publicIdMatch && publicIdMatch[1].toLowerCase().endsWith('.pdf'));
                    
                    // For Cloudinary PDFs, ensure the URL is properly formatted
                    // Cloudinary raw files (PDFs) can be viewed directly
                    let pdfUrl = fileUrl;
                    
                    // If it's a Cloudinary URL but doesn't have .pdf extension, try to add it
                    if (isPDF && fileUrl.includes('res.cloudinary.com') && !fileUrl.includes('.pdf')) {
                      // Cloudinary raw files should work as-is, but we can try adding format
                      pdfUrl = fileUrl;
                    }
                    
                    return (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <FileText size={24} className="text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-gray-800">File Attachment</h3>
                            <p className="text-sm text-gray-500">Cloudinary file uploaded</p>
                          </div>
                        </div>
                        {isPDF ? (
                          <div className="space-y-3">
                            {/* Try iframe first, fallback to object tag */}
                            <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
                              <iframe
                                src={`${pdfUrl}#toolbar=0`}
                                className="w-full h-full"
                                title="PDF Viewer"
                                type="application/pdf"
                                onError={(e) => {
                                  // If iframe fails, try object tag
                                  e.target.style.display = 'none';
                                  const objectTag = document.createElement('object');
                                  objectTag.data = pdfUrl;
                                  objectTag.type = 'application/pdf';
                                  objectTag.className = 'w-full h-full';
                                  objectTag.style.display = 'block';
                                  e.target.parentElement.appendChild(objectTag);
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(fileUrl, '_blank')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Eye size={18} />
                                Open in New Tab
                              </button>
                              <a
                                href={fileUrl}
                                download
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                              >
                                <Download size={18} />
                                Download PDF
                              </a>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={18} />
                            View File
                          </button>
                        )}
                      </div>
                    );
                  }
                }
                // Check if content is a direct URL
                if (content.startsWith('http://') || content.startsWith('https://')) {
                  const isPDF = content.toLowerCase().endsWith('.pdf') || content.includes('.pdf') || content.includes('format=pdf');
                  
                  return (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText size={24} className="text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">File Attachment</h3>
                          <p className="text-sm text-gray-500">External file link</p>
                        </div>
                      </div>
                      {isPDF ? (
                        <div className="space-y-3">
                          <iframe
                            src={content}
                            className="w-full h-96 border border-gray-300 rounded-lg"
                            title="PDF Viewer"
                          />
                          <button
                            onClick={() => window.open(content, '_blank')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={18} />
                            Open in New Tab
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => window.open(content, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye size={18} />
                          View File
                        </button>
                      )}
                    </div>
                  );
                }
                try {
                  content = JSON.parse(content);
                } catch (e) {
                  // Try to extract JSON from string
                  const jsonMatch = content.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    try {
                      content = JSON.parse(jsonMatch[0]);
                    } catch (e2) {
                      return <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>;
                    }
                  } else {
                    return <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{content}</pre>;
                  }
                }
              }

              // Render based on content structure
              if (post.type === 'ppt' && content.slides) {
                return (
                  <div className="space-y-6">
                    {content.slides.map((slide, index) => {
                      const bullets = resolveSlideBullets(slide);
                      const speakerNotes = resolveSpeakerNotes(slide);
                      return (
                        <div
                          key={index}
                          className="border-l-4 border-purple-500 dark:border-purple-400 pl-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl"
                        >
                          <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">
                            Slide {index + 1}: {slide.title}
                          </h3>
                          {bullets.length > 0 && (
                            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                              {bullets.map((bullet, bulletIndex) => (
                                <li key={bulletIndex}>{bullet}</li>
                              ))}
                            </ul>
                          )}
                          {speakerNotes && (
                            <div className="mt-4 p-4 bg-white dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600">
                              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                Speaker Notes:
                              </p>
                              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{speakerNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              } else if (content.sections && Array.isArray(content.sections)) {
                return (
                  <div className="space-y-6">
                    {content.sections.map((section, index) => (
                      <div key={index} className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{section.title}</h3>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                  </div>
                );
              } else if (content.questions && Array.isArray(content.questions)) {
                return (
                  <div className="space-y-6">
                    {content.questions.map((question, index) => (
                      <div key={index} className="border-l-4 border-emerald-500 dark:border-emerald-400 pl-6 py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">Q{index + 1}.</span>
                          <p className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1">{question.question}</p>
                        </div>
                        {question.answer && (
                          <div className="ml-8 mt-4 p-4 bg-white dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Answer:</p>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{question.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              } else if (content.keyPoints || content.formulae || content.definitions) {
                return (
                  <div className="space-y-6">
                    {content.keyPoints && content.keyPoints.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border-l-4 border-amber-500 dark:border-amber-500">
                        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">Key Points</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                          {content.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.formulae && content.formulae.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border-l-4 border-indigo-500 dark:border-indigo-500">
                        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">Formulae</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                          {content.formulae.map((formula, index) => (
                            <li key={index}>{formula}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.definitions && content.definitions.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border-l-4 border-blue-500 dark:border-blue-500">
                        <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">Definitions</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                          {content.definitions.map((definition, index) => (
                            <li key={index}>{definition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono">{JSON.stringify(content, null, 2)}</pre>
                  </div>
                );
              }
            })()}
          </div>

          {/* Comments */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-8 mt-10">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Comments</h2>
            {isAuthenticated && (
              <form onSubmit={handleComment} className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2.5 font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all font-medium"
                >
                  Post Comment
                </button>
              </form>
            )}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{comment.userId?.name || 'Anonymous'}</p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    {showCloneModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 w-full max-w-md scale-100 transform transition-all duration-300">
            <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">Clone to Workspace</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              Select a subject to clone this content into your workspace.
            </p>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
            >
              <option value="" disabled className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Select a Subject...</option>
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {subject.name} {subject.code ? `(${subject.code})` : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCloneModal(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                Clone Content
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostDetail;

