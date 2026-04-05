import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Loader2,
  History,
  Hash,
  AlignLeft,
  ListChecks,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  loadQuickRevisionSessions,
  pushQuickRevisionSession,
} from '../utils/quickRevisionSessions';
import { formatDistanceToNow } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const QuickRevision = () => {
  const toast = useToast();
  const [topicDescription, setTopicDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [extraDetails, setExtraDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState(() => loadQuickRevisionSessions());

  const refreshSessions = useCallback(() => {
    setSessions(loadQuickRevisionSessions());
  }, []);

  useEffect(() => {
    refreshSessions();
    const fn = () => refreshSessions();
    window.addEventListener('acadbuddy-quick-rvsn', fn);
    return () => window.removeEventListener('acadbuddy-quick-rvsn', fn);
  }, [refreshSessions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = topicDescription.trim();
    if (!trimmed) {
      toast.warning('Describe what you want to revise (topic, unit, or context).');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/exam/quick-revision', {
        topicDescription: trimmed,
        questionCount,
        extraDetails: extraDetails.trim(),
      });

      const content = data.content;
      setResult(content);

      const preview =
        Array.isArray(content?.keyPoints) && content.keyPoints.length
          ? String(content.keyPoints[0]).slice(0, 120)
          : 'Quick revision generated';

      pushQuickRevisionSession({
        topicPreview: trimmed.slice(0, 80),
        questionCount,
        summaryPreview: preview,
      });
      refreshSessions();

      if (data.savedContentId) {
        toast.success('Revision ready — also saved under your first subject.');
      } else {
        toast.success('Revision notes generated. Add a subject in Subjects to auto-save next time.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Could not generate revision notes';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="w-full max-w-7xl mx-auto pb-12 px-0"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50 mb-3">
                <Zap size={14} />
                Text-only · fast turnaround
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-orange-600 to-rose-700 dark:from-amber-400 dark:via-orange-400 dark:to-rose-300">
                Quick Rvsn
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
                Paste what you need to revise — topic, unit, or past-paper focus. We generate key points, definitions,
                formulae, and a set of review questions. No file uploads here.
              </p>
            </div>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/80 bg-white/85 dark:bg-slate-900/75 dark:border-slate-800/80 p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.2)] backdrop-blur-xl space-y-6"
          >
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <AlignLeft size={14} />
                Topic / context <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                rows={5}
                placeholder="e.g. Unit 3 — Operating systems: deadlock, scheduling, paging. Exam in 2 days, focus on numericals."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Hash size={14} />
                  How many review questions?
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {[3, 5, 7, 10, 12, 15, 20].map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pb-1">
                  Short recall + application-style questions with model answers, tailored to your context.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <ListChecks size={14} />
                Specific details (optional)
              </label>
              <textarea
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                rows={4}
                placeholder="Exam pattern, marking scheme, topics to skip, difficulty, language, or past mistakes to address…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate quick revision
                </>
              )}
            </button>
          </motion.form>

          {result && (
            <motion.div
              variants={itemVariants}
              className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 sm:p-8 space-y-8 shadow-inner"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={20} className="text-amber-600 dark:text-amber-400" />
                Your revision pack
              </h2>

              {Array.isArray(result.keyPoints) && result.keyPoints.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Key points
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-800 dark:text-slate-200">
                    {result.keyPoints.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </section>
              )}

              {Array.isArray(result.definitions) && result.definitions.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Definitions
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                    {result.definitions.map((d, i) => (
                      <li key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2">
                        {d}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {Array.isArray(result.formulae) && result.formulae.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Formulae
                  </h3>
                  <ul className="font-mono text-sm space-y-1 text-slate-800 dark:text-slate-200">
                    {result.formulae.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </section>
              )}

              {Array.isArray(result.reviewQuestions) && result.reviewQuestions.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                    Review questions
                  </h3>
                  <div className="space-y-4">
                    {result.reviewQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {i + 1}. {q.question}
                        </p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="font-semibold text-amber-800 dark:text-amber-300">Answer: </span>
                          {q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </div>

        <motion.aside
          variants={itemVariants}
          className="lg:col-span-4 lg:sticky lg:top-24 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 flex flex-col max-h-[min(85vh,640px)]"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
            <History size={18} className="text-amber-600 dark:text-amber-400" />
            History
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Recent Quick Rvsn runs on this device
          </p>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
              No sessions yet — generate your first pack above.
            </p>
          ) : (
            <ul className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/50 px-3 py-2.5"
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                    {s.topicPreview}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {s.questionCount} Q ·{' '}
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                  </p>
                  {s.summaryPreview ? (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{s.summaryPreview}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default QuickRevision;
