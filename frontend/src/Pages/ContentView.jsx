import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Share2, Download, FileText, Presentation, FileCheck, BookOpen, ClipboardList } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/layout/Layout';

const ContentView = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [contentId]);

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
    // Navigate to share modal or community page
    navigate(`/subjects/${content?.subjectId?._id || content?.subjectId}`, { 
      state: { shareContentId: contentId } 
    });
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
      mock_paper: 'Mock Paper'
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/subjects/${content.subjectId?._id || content.subjectId}`}
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
              <Link
                to={`/focus/${content.type}/${content._id}`}
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
          {content.type === 'ppt' && content.content?.slides ? (
            <div className="space-y-8">
              {content.content.slides.map((slide, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-6 py-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{slide.title}</h2>
                  {slide.bullets && slide.bullets.length > 0 && (
                    <ul className="space-y-2 text-gray-700">
                      {slide.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start">
                          <span className="mr-2 text-purple-600">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {slide.speakerNotes && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-1">Speaker Notes:</p>
                      <p className="text-gray-700">{slide.speakerNotes}</p>
                    </div>
                  )}
                </div>
              ))}
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
          ) : content.content?.keyPoints || content.content?.formulae || content.content?.definitions ? (
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
    </Layout>
  );
};

export default ContentView;

