import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Clock, Play, Pause, Square } from 'lucide-react';
import api from '../services/api';

const FocusMode = () => {
  const { mode, contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchContent();
    startSession();
  }, [contentId, mode]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const fetchContent = async () => {
    try {
      const response = await api.get(`/content/item/${contentId}`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const response = await api.post('/sessions/start', {
        subjectId: content?.subjectId,
        mode: mode || 'notes',
        contentId
      });
      setSessionId(response.data._id);
      setIsRunning(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/end`);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
    navigate(-1);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={endSession}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
          <h1 className="text-xl font-semibold">{content?.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={endSession}
            className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Square size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {content?.type === 'ppt' && content.content.slides ? (
          <div className="space-y-8">
            {content.content.slides.map((slide, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
                <ul className="space-y-2 text-lg">
                  {slide.bullets?.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {slide.speakerNotes && (
                  <div className="mt-6 p-4 bg-gray-700 rounded text-sm text-gray-300">
                    <strong>Notes:</strong> {slide.speakerNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : content?.content.sections ? (
          <div className="prose prose-invert max-w-none">
            {content.content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        ) : content?.content.questions ? (
          <div className="space-y-6">
            {content.content.questions.map((question, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-xl font-bold">Q{index + 1}.</span>
                  <p className="text-lg flex-1">{question.question}</p>
                </div>
                {question.answer && (
                  <div className="ml-8 mt-4 p-4 bg-gray-700 rounded">
                    <p className="text-gray-300 whitespace-pre-wrap">{question.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(content?.content, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;

