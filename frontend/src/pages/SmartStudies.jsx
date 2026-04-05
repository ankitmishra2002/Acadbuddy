import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  FileText,
  Tags,
  Upload,
  X,
  Loader2,
  History,
  ChevronRight,
  AlignLeft,
  Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const SESSIONS_KEY = 'smartStudies_sessions_v1';
const MAX_SESSIONS = 12;

const WORD_COUNT_PRESETS = [
  { value: 200, label: '~200 words (brief)' },
  { value: 350, label: '~350 words (short)' },
  { value: 500, label: '~500 words (standard)' },
  { value: 750, label: '~750 words (detailed)' },
  { value: 1000, label: '~1000 words (in-depth)' },
  { value: 1500, label: '~1500 words (comprehensive)' },
];

const loadSessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveSessions = (sessions) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
};

function highlightExcerpt(excerpt, keywords) {
  if (!excerpt || !keywords?.length) {
    return excerpt;
  }
  const list = keywords.filter(Boolean).sort((a, b) => b.length - a.length);
  const pattern = list
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!pattern) return excerpt;
  const re = new RegExp(`(${pattern})`, 'gi');
  const parts = excerpt.split(re);
  return parts.map((part, idx) => {
    const isKw = list.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isKw) {
      return (
        <mark
          key={`${idx}-${part}`}
          className="rounded px-0.5 bg-amber-200/90 text-slate-900 dark:bg-amber-500/40 dark:text-amber-50"
        >
          {part}
        </mark>
      );
    }
    return <span key={`${idx}-${part}`}>{part}</span>;
  });
}

const SmartStudies = () => {
  const toast = useToast();
  const [activeTool, setActiveTool] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [topicsDetails, setTopicsDetails] = useState('');
  const [targetWordCount, setTargetWordCount] = useState(500);
  const [keywordFocus, setKeywordFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState(loadSessions);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [savedContentId, setSavedContentId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/subjects');
        if (!cancelled && Array.isArray(data)) setSubjects(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!activeTool) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeTool]);

  const resetPanel = useCallback(() => {
    setFile(null);
    setTopicsDetails('');
    setTargetWordCount(500);
    setKeywordFocus('');
    setResult(null);
    setSavedContentId(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const closePanel = useCallback(() => {
    setActiveTool(null);
    resetPanel();
  }, [resetPanel]);

  useEffect(() => {
    if (!activeTool) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeTool, closePanel]);

  const pushSession = useCallback((mode, previewText) => {
    const entry = {
      id: `${Date.now()}`,
      mode,
      label: mode === 'summarize' ? 'AI text summarization' : 'Keyword extraction',
      createdAt: new Date().toISOString(),
      preview: (previewText || '').slice(0, 120),
    };
    setSessions((prev) => {
      const next = [entry, ...prev.filter((s) => s.preview !== entry.preview || s.mode !== entry.mode)].slice(
        0,
        MAX_SESSIONS
      );
      saveSessions(next);
      return next;
    });
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setError('');
    setResult(null);
    setFile(f || null);
  };

  const runAnalysis = async () => {
    if (!file || !activeTool) {
      setError('Please upload a PDF or image first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setSavedContentId(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', activeTool);
      if (subjectId) formData.append('subjectId', subjectId);
      if (activeTool === 'summarize') {
        formData.append('topicsDetails', topicsDetails);
        formData.append('targetWordCount', String(targetWordCount));
      } else {
        formData.append('keywordFocus', keywordFocus);
      }

      const { data } = await api.post('/smart-studies/run', formData);

      setResult(data);
      setSavedContentId(data.savedContentId || null);
      if (data.savedContentId) {
        toast.success('Saved to your workspace — view or share from the subject’s My Generated Content.');
      }
      if (activeTool === 'summarize' && data.summary) {
        pushSession('summarize', data.summary);
      } else if (activeTool === 'keywords') {
        const preview =
          (data.keywords && data.keywords.join(', ')) || data.excerpt || '';
        pushSession('keywords', preview);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Check your file and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPdf = file?.type === 'application/pdf';
  const isSummarize = activeTool === 'summarize';

  const panelTitle = useMemo(() => {
    if (activeTool === 'summarize') return 'AI text summarization';
    if (activeTool === 'keywords') return 'Keyword extraction';
    return '';
  }, [activeTool]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  const modalShell =
    typeof document !== 'undefined' &&
    activeTool &&
    createPortal(
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 md:p-6"
        >
          <div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={closePanel}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-studies-panel-title"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 flex max-h-[min(92vh,900px)] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl ${
              isSummarize
                ? 'max-w-3xl border-blue-200/80 bg-white dark:border-blue-900/50 dark:bg-slate-950'
                : 'max-w-lg border-violet-300/90 bg-violet-50/30 dark:border-violet-800/80 dark:bg-slate-950'
            }`}
          >
            <div
              className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-5 ${
                isSummarize
                  ? 'border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:border-blue-900/40'
                  : 'border-violet-200/80 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-700 dark:border-violet-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSummarize ? (
                  <AlignLeft className="shrink-0 text-white/90" size={22} />
                ) : (
                  <Hash className="shrink-0 text-white/90" size={22} />
                )}
                <h2
                  id="smart-studies-panel-title"
                  className="truncate text-base font-bold text-white sm:text-lg"
                >
                  {panelTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="shrink-0 rounded-xl p-2 text-white/90 transition-colors hover:bg-white/15"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div
                className={`grid gap-5 p-4 sm:p-5 ${
                  isSummarize ? 'lg:grid-cols-2 lg:items-start' : 'grid-cols-1'
                }`}
              >
                <div className="flex min-h-0 flex-col gap-4">
                  <div>
                    <label
                      className={`mb-2 block text-xs font-bold uppercase tracking-wider ${
                        isSummarize
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'font-mono text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      {isSummarize ? 'Upload document' : 'Source file'}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors ${
                        isSummarize
                          ? 'border-slate-200 bg-slate-50/80 hover:border-blue-400 dark:border-slate-600 dark:bg-slate-900/50 dark:hover:border-blue-500'
                          : 'rounded-3xl border-violet-400/70 bg-violet-100/40 hover:border-fuchsia-500 dark:border-violet-500/50 dark:bg-violet-950/30 dark:hover:border-fuchsia-400'
                      }`}
                    >
                      <Upload
                        size={28}
                        className={isSummarize ? 'text-blue-500' : 'text-violet-600 dark:text-violet-400'}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {file ? file.name : isSummarize ? 'Drop or click to upload' : 'Attach PDF or image'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        JPEG, PNG, WebP, or PDF · max ~15 MB
                      </span>
                    </button>
                  </div>

                  {previewUrl && (
                    <div
                      className={`flex min-h-[200px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-slate-100 dark:bg-slate-900 ${
                        isSummarize
                          ? 'border-slate-200 dark:border-slate-800'
                          : 'border-violet-200 dark:border-violet-900/60'
                      }`}
                    >
                      <div
                        className={`border-b px-3 py-2 text-xs font-semibold ${
                          isSummarize
                            ? 'border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400'
                            : 'border-violet-200 font-mono uppercase tracking-wide text-violet-800 dark:border-violet-900 dark:text-violet-300'
                        }`}
                      >
                        {isSummarize ? 'Preview' : 'File preview'}
                      </div>
                      <div className="relative flex min-h-[180px] flex-1 items-center justify-center overflow-auto p-3">
                        {isPdf ? (
                          <iframe
                            title="PDF preview"
                            src={previewUrl}
                            className="h-[min(240px,40vh)] w-full min-h-[180px] rounded-lg bg-white shadow-sm"
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Upload preview"
                            className="max-h-[min(240px,40vh)] w-auto max-w-full object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex min-h-0 flex-col gap-4">
                  {isSummarize ? (
                    <>
                      <div>
                        <label
                          htmlFor="smart-studies-topics"
                          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          Content topics & details
                        </label>
                        <textarea
                          id="smart-studies-topics"
                          value={topicsDetails}
                          onChange={(e) => setTopicsDetails(e.target.value)}
                          rows={5}
                          placeholder="Describe chapters, concepts, or what you want the summary to focus on (e.g. “Compare CSR vs SSR and list trade-offs”)."
                          className="min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="smart-studies-words"
                          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          Target length
                        </label>
                        <select
                          id="smart-studies-words"
                          value={targetWordCount}
                          onChange={(e) => setTargetWordCount(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        >
                          {WORD_COUNT_PRESETS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          The model will aim near this length (about ±25%).
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-violet-200/80 bg-violet-100/50 p-3 dark:border-violet-800/60 dark:bg-violet-950/40">
                        <p className="text-xs font-mono font-semibold uppercase tracking-wide text-violet-900 dark:text-violet-200">
                          Key phrase scanner
                        </p>
                        <p className="mt-1 text-xs text-violet-800/90 dark:text-violet-300/90">
                          Tune which themes matter—otherwise we infer from the file alone.
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="smart-studies-keyword-focus"
                          className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400"
                        >
                          Focus / scope
                        </label>
                        <textarea
                          id="smart-studies-keyword-focus"
                          value={keywordFocus}
                          onChange={(e) => setKeywordFocus(e.target.value)}
                          rows={6}
                          placeholder="Optional: e.g. “Technical terms only”, “Exam Unit 3”, “Names and dates”…"
                          className="min-h-[140px] w-full resize-y rounded-2xl border-2 border-violet-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-violet-800 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                      {error}
                    </div>
                  )}

                  {subjects.length > 0 && (
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Save to subject (optional)
                      </label>
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="">Default — first subject or &quot;My workspace&quot;</option>
                        {subjects.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                            {s.code ? ` (${s.code})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || !file}
                    onClick={runAnalysis}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSummarize
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Working…
                      </>
                    ) : (
                      <>
                        {isSummarize ? <Sparkles size={20} /> : <Tags size={20} />}
                        {isSummarize ? 'Generate summary' : 'Extract keywords'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {(result?.mode === 'summarize' && result.summary) ||
              (result?.mode === 'keywords' && (result.keywords?.length > 0 || result.excerpt)) ? (
                <div
                  className={`border-t px-4 py-4 sm:px-5 ${
                    isSummarize
                      ? 'border-slate-200 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/80'
                      : 'border-violet-200/80 bg-violet-50/50 dark:border-violet-900/50 dark:bg-slate-900/90'
                  }`}
                >
                  {savedContentId && (
                    <div className="mb-4 flex justify-end">
                      <Link
                        to={`/content/${savedContentId}`}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                      >
                        Open saved copy
                      </Link>
                    </div>
                  )}
                  {result?.mode === 'summarize' && result.summary && (
                    <div>
                      <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">Summary</h3>
                      <div className="relative max-h-[min(45vh,380px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 text-sm text-slate-800 dark:text-slate-200">
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {result?.mode === 'keywords' && (
                    <div className="space-y-4">
                      {result.keywords?.length > 0 && (
                        <div>
                          <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-violet-800 dark:text-violet-300">
                            Keywords
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {result.keywords.map((kw, i) => (
                              <span
                                key={`${i}-${kw}`}
                                className="inline-flex items-center rounded-full border border-violet-300/80 bg-white px-3 py-1 font-mono text-xs font-semibold text-violet-900 dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-100"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.excerpt && (
                        <div>
                          <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-violet-800 dark:text-violet-300">
                            Highlighted excerpt
                          </h3>
                          <div className="relative max-h-[min(36vh,280px)] overflow-y-auto rounded-xl border border-violet-200 bg-white/90 p-4 dark:border-violet-900 dark:bg-slate-950/80">
                            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                              {highlightExcerpt(result.excerpt, result.keywords)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="relative w-full max-w-7xl mx-auto pb-10 px-1 sm:px-0"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 mb-3">
            <Sparkles size={14} />
            Multimodal · OpenRouter
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tight">
            Smart Studies
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
            Upload a PDF or image, add optional context or topics, then summarize content or extract highlighted
            keywords.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-8 space-y-4">
          <button
            type="button"
            onClick={() => {
              setActiveTool('summarize');
              resetPanel();
            }}
            className="w-full text-left rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI text summarization</h2>
                  <ChevronRight
                    size={18}
                    className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Centered workspace: topics, target length, then a structured summary.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('keywords');
              resetPanel();
            }}
            className="w-full text-left rounded-2xl border-2 border-violet-200/90 dark:border-violet-800/60 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/20 dark:to-slate-900/60 backdrop-blur-md p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-fuchsia-300 dark:hover:border-fuchsia-800 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform ring-2 ring-violet-200/50 dark:ring-violet-900/50">
                <Tags size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Extract keywords</h2>
                  <span className="hidden sm:inline rounded-md bg-violet-200/60 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-violet-900 dark:bg-violet-900/50 dark:text-violet-200">
                    Scanner
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-slate-400 group-hover:text-violet-500 transition-colors shrink-0"
                  />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  A different flow: focus hints, monospace fields, and tag-style results.
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        <motion.aside
          variants={itemVariants}
          className="lg:col-span-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md p-4 sm:p-5 min-h-[280px] flex flex-col"
        >
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold mb-4">
            <History size={18} className="text-slate-500" />
            Recent sessions
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
              Your recent runs will appear here after you summarize or extract keywords.
            </p>
          ) : (
            <ul className="relative space-y-2 flex-1 overflow-y-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pr-1">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-3 py-2.5"
                >
                  <div
                    className={`text-xs font-semibold ${
                      s.mode === 'keywords'
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                  {s.preview ? (
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{s.preview}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </motion.aside>
      </div>

      {modalShell}
    </motion.div>
  );
};

export default SmartStudies;
