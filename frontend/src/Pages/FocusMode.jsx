import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, Clock, Play, Pause, Square } from 'lucide-react';
import api from '../services/api';
import { recordFeatureVisit } from '../utils/recentActivity';
import { resolveSlideBullets, resolveSpeakerNotes } from '../utils/pptSlideUtils';
import { formatRevisionDefinition } from '../utils/revisionFormat';

const FocusMode = () => {
  const { mode, contentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!mode || !contentId) return;
    recordFeatureVisit({
      id: `focus-${mode}-${contentId}`,
      label: `Focus mode · ${mode}`,
      path: `/focus/${mode}/${contentId}`
    });
  }, [mode, contentId]);

  useEffect(() => {
    if (!contentId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setContent(null);
      setSessionId(null);
      setIsRunning(false);
      try {
        const response = await api.get(`/content/item/${contentId}`);
        if (cancelled) return;
        const doc = response.data;
        setContent(doc);
        setLoading(false);

        const subjectRef = doc.subjectId?._id || doc.subjectId;
        api
          .post('/sessions/start', {
            subjectId: subjectRef,
            mode: doc.type || mode || 'notes',
            contentId
          })
          .then((sessionRes) => {
            if (!cancelled) {
              setSessionId(sessionRes.data._id);
              setIsRunning(true);
            }
          })
          .catch((err) => console.error('Focus session start failed (non-blocking):', err));
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load content:', error);
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [contentId, mode]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const endSession = async () => {
    if (sessionId) {
      try {
        await api.put(`/sessions/${sessionId}/end`);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }
    const st = location.state;
    if (st?.subjectReturnTab === 'content' && st?.subjectId) {
      navigate(`/subjects/${st.subjectId}?tab=content`, { replace: true });
      return;
    }
    navigate(-1);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const c = content?.content;
  const hasRevisionShape =
    c &&
    ((Array.isArray(c.keyPoints) && c.keyPoints.length > 0) ||
      (Array.isArray(c.formulae) && c.formulae.length > 0) ||
      (Array.isArray(c.definitions) && c.definitions.length > 0) ||
      (Array.isArray(c.reviewQuestions) && c.reviewQuestions.length > 0));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-400 text-center">Could not load this content.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
          <button type="button" onClick={endSession} className="text-gray-400 hover:text-white shrink-0">
            <X size={24} />
          </button>
          <h1 className="text-xl font-semibold truncate">{content?.title}</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={20} />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button type="button" onClick={endSession} className="p-2 bg-red-600 rounded-lg hover:bg-red-700">
            <Square size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {content?.type === 'ppt' && c?.slides ? (
          <div className="space-y-8">
            {c.slides.map((slide, index) => {
              const bullets = resolveSlideBullets(slide);
              const speakerNotes = resolveSpeakerNotes(slide);
              return (
                <div key={index} className="bg-gray-800 p-8 rounded-lg">
                  <p className="text-sm text-purple-400 mb-2">Slide {index + 1}</p>
                  <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
                  {bullets.length > 0 && (
                    <ul className="space-y-2 text-lg text-gray-200">
                      {bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <span className="shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {speakerNotes && (
                    <div className="mt-6 p-4 bg-gray-700 rounded text-sm text-gray-300 whitespace-pre-wrap">
                      <strong>Notes:</strong> {speakerNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : c?.sections ? (
          <div className="prose prose-invert max-w-none">
            {c.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
            ))}
          </div>
        ) : c?.questions ? (
          <div className="space-y-6">
            {c.questions.map((question, index) => (
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
        ) : hasRevisionShape ? (
          <div className="space-y-10">
            {c.keyPoints?.length > 0 && (
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-amber-300 mb-4">Key points</h2>
                <ul className="space-y-3 text-gray-200">
                  {c.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">•</span>
                      <span className="leading-relaxed">{typeof point === 'string' ? point : String(point)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.formulae?.length > 0 && (
              <div className="bg-gray-800 p-8 rounded-lg border-l-4 border-violet-500">
                <h2 className="text-2xl font-bold text-violet-300 mb-4">Formulae</h2>
                <ul className="space-y-3 font-mono text-sm sm:text-base text-violet-100">
                  {c.formulae.map((f, index) => (
                    <li key={index} className="bg-gray-900/60 px-4 py-3 rounded-lg whitespace-pre-wrap break-words">
                      {typeof f === 'string' ? f : String(f)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.definitions?.length > 0 && (
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-emerald-300 mb-4">Definitions</h2>
                <div className="space-y-4">
                  {c.definitions.map((def, index) => {
                    const { term, body } = formatRevisionDefinition(def);
                    return (
                      <div key={index} className="border-l-4 border-emerald-500 bg-gray-900/40 pl-4 py-3 rounded-r-lg">
                        {term ? <p className="font-bold text-white mb-1">{term}</p> : null}
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {c.reviewQuestions?.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-sky-300">Review questions</h2>
                {c.reviewQuestions.map((rq, index) => (
                  <div key={index} className="bg-gray-800 p-6 rounded-lg">
                    <p className="text-lg font-medium text-white mb-2">{rq.question}</p>
                    {rq.answer && (
                      <p className="text-gray-400 text-sm whitespace-pre-wrap border-t border-gray-700 pt-3 mt-2">
                        {rq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : c?.units ? (
          <div className="space-y-6">
            {c.units.map((unit, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">{unit.name}</h3>
                {unit.topics && (
                  <ul className="space-y-2 text-gray-200">
                    {unit.topics.map((topic, topicIndex) => (
                      <li key={topicIndex} className="flex items-start gap-2">
                        <span className="shrink-0">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(c, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
