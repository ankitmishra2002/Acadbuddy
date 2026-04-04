import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Upload, FileText, Brain,
    Target, Zap, MessageSquare, ChevronRight,
    Shield, Star, Play, Info, X,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useContentStore from '../store/contentStore';
import useQuizStore from '../store/quizStore';
import useSubjectStore from '../store/subjectStore';
import { useNavigate } from 'react-router-dom';
import { notifyError, notifySuccess } from '../lib/notifications';
import GenerationOverlay from '../components/ui/GenerationOverlay';

const ToolCard = ({ title, icon: Icon, desc, color, onClick }) => (
    <motion.button
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group relative rounded-4xl border border-gray-200 bg-white p-8 text-left transition-all hover:shadow-2xl hover:shadow-black/5 dark:border-white/8 dark:bg-white/3"
    >
        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${color} bg-opacity-10 shadow-inner transition-transform group-hover:rotate-12`}>
            <Icon size={28} className={color.replace('bg-', 'text-')} />
        </div>
        <h3 className="mb-2 text-xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-slate-400">{desc}</p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-6 dark:border-white/6">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                Launch Tool <Zap size={10} />
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-violet-500 group-hover:text-white dark:bg-white/5">
                <ChevronRight size={16} />
            </div>
        </div>
    </motion.button>
);

const TOOL_DEFINITIONS = [
    {
        id: 'notes',
        title: 'Note Architect',
        icon: FileText,
        desc: 'Transform syllabus units into comprehensive, structured markdown notes with key terms and summaries.',
        color: 'bg-violet-500',
        category: 'generation',
    },
    {
        id: 'quiz',
        title: 'Quiz Master AI',
        icon: Brain,
        desc: 'Generate adaptive mock tests and multiple-choice questions from your upload materials.',
        color: 'bg-emerald-500',
        category: 'learning',
    },
    {
        id: 'ppt',
        title: 'Slide Generator',
        icon: Play,
        desc: 'Convert complex topics into bite-sized presentation slides ready for your next academic seminar.',
        color: 'bg-blue-500',
        category: 'generation',
    },
    {
        id: 'report',
        title: 'Academic Reporter',
        icon: Shield,
        desc: 'Generate formal reports and case study analyses following strict academic formatting guidelines.',
        color: 'bg-rose-500',
        category: 'generation',
    },
    {
        id: 'summary',
        title: 'PDF Summarizer',
        icon: Target,
        desc: 'Instantly condense massive textbook chapters or research papers into high-impact key takeaways.',
        color: 'bg-amber-500',
        category: 'learning',
    },
    {
        id: 'explain',
        title: 'Concept Explainer',
        icon: MessageSquare,
        desc: 'Ask our AI to explain difficult concepts "like I am five" or in technical depth.',
        color: 'bg-indigo-500',
        category: 'learning',
    },
];

const TOOL_DESCRIPTIONS = {
    notes: 'We are generating a polished set of study notes. This may take a moment while the content is structured and formatted.',
    report: 'We are building your academic report with a cleaner structure and references.',
    ppt: 'We are preparing your slide deck and speaker notes.',
    quiz: 'We are generating a new quiz with backend-backed questions.',
    summary: 'We are compressing the source content into a tight revision summary.',
    explain: 'We are generating a deeper explanation tailored to your topic.',
};

const AIWorkspace = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [pendingTool, setPendingTool] = useState(null);
    const [toolForm, setToolForm] = useState({
        subjectId: '',
        topic: '',
        customPrompt: '',
    });
    const [generationState, setGenerationState] = useState(null);

    const { generateNotes, generateReport, generatePPT } = useContentStore();
    const { generateQuiz } = useQuizStore();
    const { subjects } = useSubjectStore();

    useEffect(() => {
        if (!toolForm.subjectId && subjects.length > 0) {
            setToolForm((current) => ({ ...current, subjectId: subjects[0]._id }));
        }
    }, [subjects, toolForm.subjectId]);

    const filteredTools = useMemo(
        () => (activeTab === 'all' ? TOOL_DEFINITIONS : TOOL_DEFINITIONS.filter((tool) => tool.category === activeTab)),
        [activeTab]
    );

    const openToolModal = (toolId) => {
        if (subjects.length === 0) {
            notifyError('Add a subject first from the Subjects page.', 'No subjects available');
            navigate('/subjects');
            return;
        }

        setPendingTool(toolId);
        setToolForm({
            subjectId: subjects[0]._id,
            topic: 'Introduction to Computing',
            customPrompt: '',
        });
    };

    const closeToolModal = () => {
        if (generationState) return;
        setPendingTool(null);
    };

    const runSelectedTool = async (event) => {
        event.preventDefault();
        if (!pendingTool) return;

        setGenerationState(pendingTool);
        try {
            const { subjectId, topic, customPrompt } = toolForm;
            let result = null;

            switch (pendingTool) {
                case 'notes':
                    result = await generateNotes(subjectId, topic, { customPrompt });
                    if (result.success) {
                        notifySuccess('Notes generated successfully.', 'Generation complete');
                        navigate(`/content/${result.item._id}`);
                    }
                    break;
                case 'report':
                    result = await generateReport(subjectId, topic, { customPrompt });
                    if (result.success) {
                        notifySuccess('Report generated successfully.', 'Generation complete');
                        navigate(`/content/${result.item._id}`);
                    }
                    break;
                case 'ppt':
                    result = await generatePPT(subjectId, topic, { customPrompt });
                    if (result.success) {
                        notifySuccess('PPT generated successfully.', 'Generation complete');
                        navigate(`/content/${result.item._id}`);
                    }
                    break;
                case 'quiz':
                    result = await generateQuiz(subjectId, topic);
                    if (result.success) {
                        notifySuccess('Quiz generated successfully. Open the Subject Workspace or Focus Mode to continue.', 'Quiz ready');
                    }
                    break;
                case 'summary':
                    result = await generateNotes(subjectId, `Summary of ${topic}`, {
                        customPrompt: customPrompt || 'Summarize the source into concise revision points with the most important takeaways.',
                    });
                    if (result.success) {
                        notifySuccess('Summary generated successfully.', 'Generation complete');
                        navigate(`/content/${result.item._id}`);
                    }
                    break;
                case 'explain':
                    result = await generateNotes(subjectId, `Explanation: ${topic}`, {
                        customPrompt: customPrompt || 'Explain the concept clearly with simple examples and a short recap.',
                    });
                    if (result.success) {
                        notifySuccess('Explanation generated successfully.', 'Generation complete');
                        navigate(`/content/${result.item._id}`);
                    }
                    break;
                default:
                    notifyError('This tool is not configured yet.', 'Unavailable');
            }

            if (result && !result.success) {
                notifyError(result.message || 'Unable to generate content right now.');
            }
        } catch (error) {
            notifyError(error.response?.data?.message || error.message || 'Unable to generate content right now.');
        } finally {
            setGenerationState(null);
            setPendingTool(null);
        }
    };

    const currentTool = TOOL_DEFINITIONS.find((tool) => tool.id === pendingTool);

    return (
        <DashboardLayout>
            <div className="space-y-12 pb-20">
                <section className="flex flex-col gap-8 border-b border-gray-200 pb-12 md:flex-row md:items-end md:justify-between dark:border-white/6">
                    <div className="max-w-2xl space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
                            <Sparkles size={12} /> The Lab Ready
                        </div>
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl dark:text-white">
                            Your Personal <br />
                            <span className="bg-linear-to-r from-violet-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                                AI Academic Terminal
                            </span>
                        </h1>
                        <p className="font-medium leading-relaxed text-gray-500 dark:text-slate-400">
                            Use the workspace to generate notes, quizzes, reports, and presentation-ready content with a cleaner and more reliable input flow.
                        </p>
                    </div>

                    <div className="flex rounded-2xl bg-gray-100 p-1.5 dark:bg-white/5">
                        {['all', 'generation', 'learning'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab
                                        ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool) => (
                            <ToolCard
                                key={tool.id}
                                {...tool}
                                onClick={() => openToolModal(tool.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                <section className="group relative overflow-hidden">
                    <div className="absolute inset-0 rounded-[40px] bg-linear-to-r from-violet-600 to-indigo-700 opacity-10 transition-opacity duration-1000 group-hover:opacity-100" />
                    <div className="relative flex flex-col items-center justify-between gap-10 rounded-[40px] border border-gray-200 bg-white p-10 md:flex-row md:p-16 dark:border-white/8 dark:bg-white/2">
                        <div className="max-w-xl space-y-4">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500">
                                <Star size={32} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Need higher accuracy?</h2>
                            <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">
                                Upgrade to pro-grade models for deeper analysis and larger generation limits when you are ready.
                            </p>
                            <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <Star size={16} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Pro Models</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-indigo-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Priority Queue</span>
                                </div>
                            </div>
                        </div>
                        <button className="rounded-3xl bg-gray-900 px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-[#060812]">
                            Upgrade to Pro
                        </button>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="flex items-center gap-6 rounded-4xl border border-gray-100 bg-gray-50 p-8 dark:border-white/6 dark:bg-white/2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm dark:bg-white/5">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Upload Repository</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Manage your uploaded syllabus and reference resources.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 rounded-4xl border border-gray-100 bg-gray-50 p-8 dark:border-white/6 dark:bg-white/2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm dark:bg-white/5">
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Generation Limits</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Token usage, retries, and file support should now be more visible and reliable.</p>
                        </div>
                    </div>
                </div>

            </div>

            <GenerationOverlay
                open={Boolean(generationState)}
                fullscreen
                accent={
                    generationState === 'quiz' ? 'emerald' : generationState === 'report' ? 'rose' : generationState === 'ppt' ? 'blue' : 'violet'
                }
                title={currentTool ? `Generating ${currentTool.title}` : 'Generating content'}
                description={generationState ? TOOL_DESCRIPTIONS[generationState] : 'Please wait while the AI prepares your content.'}
            />

            <AnimatePresence>
                {pendingTool && !generationState && typeof document !== 'undefined' && createPortal(
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-190 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 18 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 18 }}
                            transition={{ duration: 0.24 }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-4xl border border-white/10 bg-[#0b1020]/95 p-8 text-white shadow-2xl shadow-black/40"
                        >
                            <button
                                type="button"
                                onClick={closeToolModal}
                                className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition-colors hover:text-white"
                                aria-label="Close tool modal"
                            >
                                <X size={18} />
                            </button>

                            <div className="mb-8 space-y-2 pr-10">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
                                    <Sparkles size={12} /> {currentTool?.title || 'Generation Tool'}
                                </div>
                                <h3 className="text-3xl font-black tracking-tight text-white">Enter your subject details</h3>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    Choose the subject and topic, then add any extra instructions before the backend generation starts.
                                </p>
                            </div>

                            <form onSubmit={runSelectedTool} className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Subject</label>
                                    <select
                                        value={toolForm.subjectId}
                                        onChange={(event) => setToolForm((current) => ({ ...current, subjectId: event.target.value }))}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20"
                                    >
                                        {subjects.map((subject) => (
                                            <option key={subject._id} value={subject._id} className="bg-[#0b1020] text-white">
                                                {subject.name} ({subject.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Topic</label>
                                    <input
                                        type="text"
                                        required
                                        value={toolForm.topic}
                                        onChange={(event) => setToolForm((current) => ({ ...current, topic: event.target.value }))}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20"
                                        placeholder="e.g. Operating System Process Management"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-slate-400">Extra instructions</label>
                                    <textarea
                                        rows="4"
                                        value={toolForm.customPrompt}
                                        onChange={(event) => setToolForm((current) => ({ ...current, customPrompt: event.target.value }))}
                                        className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20"
                                        placeholder="Add format, depth, or focus area guidance for the generator"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={closeToolModal}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-violet-500/20 transition-all hover:scale-[1.01]"
                                    >
                                        Start Generation
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>,
                    document.body
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AIWorkspace;
