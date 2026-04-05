import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowLeft, Eye, Share2, Download, FileText, Presentation, FileCheck, BookOpen, ClipboardList, Sparkles, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import { downloadAsMarkdown } from '../utils/downloadUtils';
import { resolveSlideBullets, resolveSpeakerNotes } from '../utils/pptSlideUtils';
import useAuthStore from '../store/authStore';
import { useToast } from '../context/ToastContext';

const ContentView = () => {
  const toast = useToast();
  const { contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchContent();
    if (!user) {
      useAuthStore.getState().fetchUser();
    }
  }, [contentId, user]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/content/item/${contentId}`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareToCommunity = () => {
    setShowShareModal(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;

    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const title = formData.get('title') || content.title;
      const subject = formData.get('subject') || content.subjectId?.name || 'Unknown';
      const topic = formData.get('topic') || content.topic;

      const postData = new FormData();
      postData.append('contentId', content._id);
      postData.append('type', content.type);
      postData.append('title', title);
      postData.append('content', JSON.stringify(content.content));
      
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
    } catch (error) {
      toast.error('Failed to share content: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'notes':
        return <FileText className="text-blue-600" size={24} />;
      case 'report':
        return <FileCheck className="text-green-600" size={24} />;
      case 'ppt':
        return <Presentation className="text-purple-600" size={24} />;
      case 'revision_sheet':
        return <ClipboardList className="text-orange-600" size={24} />;
      case 'mock_paper':
        return <BookOpen className="text-red-600" size={24} />;
      case 'smart_study':
        return <Brain className="text-indigo-600" size={24} />;
      default:
        return <FileText className="text-gray-600" size={24} />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      notes: 'Study Notes',
      report: 'Report',
      ppt: 'PPT',
      revision_sheet: 'Revision Sheet',
      mock_paper: 'Mock Paper',
      smart_study: 'Smart Study'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !content) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Content not found'}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const subjectIdForLink = content.subjectId?._id || content.subjectId;
  const subjectBackPath =
    location.state?.subjectReturnTab === 'content' && subjectIdForLink
      ? `/subjects/${subjectIdForLink}?tab=content`
      : `/subjects/${subjectIdForLink}`;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={subjectBackPath}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Subject
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(content.type)}
                <div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getTypeLabel(content.type)}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-800 mt-2">{content.title}</h1>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Subject:</span> {content.subjectId?.name || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Topic:</span> {content.topic}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(content.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => downloadAsMarkdown(content.content, content.title)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Download size={18} />
                Download Report
              </button>
              <Link
                to={`/focus/${content.type}/${content._id}`}
                state={{
                  subjectReturnTab: location.state?.subjectReturnTab,
                  subjectId: subjectIdForLink
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye size={18} />
                Open in Focus Mode
              </Link>
              <button
                onClick={handleShareToCommunity}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 size={18} />
                Share to Community
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {content.type === 'smart_study' && content.content?.mode === 'summarize' && content.content?.summary ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{content.content.summary}</ReactMarkdown>
            </div>
          ) : content.type === 'smart_study' && content.content?.mode === 'keywords' ? (
            <div className="space-y-6">
              {content.content.keywords?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.content.keywords.map((kw, i) => (
                      <span
                        key={`${i}-${kw}`}
                        className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm text-indigo-900"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {content.content.excerpt && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Excerpt</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content.content.excerpt}</p>
                </div>
              )}
            </div>
          ) : content.type === 'ppt' && content.content?.slides ? (
            <div className="space-y-6">
              {content.content.slides.map((slide, index) => {
                const bullets = resolveSlideBullets(slide);
                const speakerNotes = resolveSpeakerNotes(slide);
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/90 dark:bg-slate-800/50 p-6 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-2">
                      Slide {index + 1}
                    </p>
                    <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-4">
                      {slide.title}
                    </h2>
                    {bullets.length > 0 && (
                      <ul className="space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-purple-600 dark:text-purple-400">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {speakerNotes && (
                      <div className="mt-4 p-4 bg-white dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-600">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Speaker notes
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {speakerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : content.content?.sections ? (
            <div className="prose max-w-none">
              {content.content.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          ) : content.content?.questions ? (
            <div className="space-y-6">
              {content.content.questions.map((question, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-xl font-bold text-blue-600">Q{index + 1}.</span>
                    <p className="text-lg text-gray-800 flex-1">{question.question}</p>
                  </div>
                  {question.answer && (
                    <div className="ml-8 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Answer:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : content.content?.units ? (
            <div className="space-y-6">
              {content.content.units.map((unit, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6 py-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{unit.name}</h3>
                  {unit.topics && (
                    <ul className="space-y-2 text-gray-700">
                      {unit.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-start">
                          <span className="mr-2 text-green-600">•</span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : content.content?.keyPoints ||
            content.content?.formulae ||
            content.content?.definitions ||
            content.content?.reviewQuestions ? (
            <div className="space-y-6">
              {content.content.keyPoints && content.content.keyPoints.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Key Points</h3>
                  <ul className="space-y-2 text-gray-700">
                    {content.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-orange-600">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {content.content.formulae && content.content.formulae.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Formulae</h3>
                  <ul className="space-y-2 text-gray-700">
                    {content.content.formulae.map((formula, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-blue-600">•</span>
                        <span>{formula}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {content.content.definitions && content.content.definitions.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Definitions</h3>
                  <ul className="space-y-2 text-gray-700">
                    {content.content.definitions.map((definition, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-600">•</span>
                        <span>{definition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {content.content.reviewQuestions && content.content.reviewQuestions.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Review questions</h3>
                  <div className="space-y-4">
                    {content.content.reviewQuestions.map((rq, index) => (
                      <div key={index} className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                        <p className="font-medium text-gray-900">{index + 1}. {rq.question}</p>
                        {rq.answer && (
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{rq.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {JSON.stringify(content.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Share to Community Modal */}
      {showShareModal && content && createPortal(
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
                  defaultValue={content.title}
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
                  defaultValue={content.subjectId?.name || ''}
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
                  defaultValue={content.topic}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="flex gap-4 pt-4 mt-8 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
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
    </Layout>
  );
};

export default ContentView;

