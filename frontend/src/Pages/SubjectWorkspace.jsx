import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, FileText, Target, 
  ChevronLeft, Layout, Zap, Brain, 
  Plus, CheckCircle2, Clock, Star,
  MessageSquare, Play, HelpCircle,
  Activity, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import useSubjectStore from '../store/subjectStore';
import useContentStore from '../store/contentStore';
import useQuizStore from '../store/quizStore';
import GenerationOverlay from '../components/ui/GenerationOverlay';
import { notifyError, notifySuccess } from '../lib/notifications';

const UnitCard = ({ unit, index, isActive, onClick }) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`w-full text-left p-4 rounded-2xl border transition-all ${
      isActive 
        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' 
        : 'bg-white dark:bg-white/4 border-gray-100 dark:border-white/8 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/6'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10 text-violet-500'}`}>
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="text-sm font-black tracking-tight">{unit.name}</div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-500'}`}>
            {unit.status}
        </div>
      </div>
      {unit.completed && <CheckCircle2 size={16} className={isActive ? 'text-white' : 'text-emerald-500'} />}
    </div>
  </motion.button>
);

const ActionButton = ({ label, icon: Icon, color, onClick, description, disabled = false }) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={disabled}
    onClick={onClick}
    className={`group relative rounded-3xl border border-gray-200 bg-white p-6 text-left transition-all hover:shadow-2xl hover:shadow-black/5 dark:border-white/8 dark:bg-white/4 ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
  >
    <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">{label}</h4>
    <p className="text-gray-500 dark:text-slate-500 text-xs font-medium leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center gap-2 text-violet-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <Zap size={10} />
    </div>
  </motion.button>
);

const SubjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { generateNotes, generateReport, loading: contentLoading } = useContentStore();
  const { generateQuiz, loading: quizLoading } = useQuizStore();
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [generationAction, setGenerationAction] = useState(null);

  const subject = subjects.find(s => s._id === id);
  const isGenerating = Boolean(generationAction) || contentLoading || quizLoading;

  const runGeneration = async (action) => {
    setGenerationAction(action);

    try {
      const topic = units[selectedUnit].name;
      let result = null;

      switch (action) {
        case 'notes':
          result = await generateNotes(id, topic);
          if (result.success) {
            notifySuccess('Notes generated successfully.', 'Generation complete');
            navigate(`/content/${result.item._id}`);
          }
          break;
        case 'quiz':
          result = await generateQuiz(id, topic);
          if (result.success) {
            notifySuccess('Quiz generated successfully. Open the AI Study Lab to review it.', 'Quiz ready');
          }
          break;
        case 'report':
          result = await generateReport(id, topic);
          if (result.success) {
            notifySuccess('Report generated successfully.', 'Generation complete');
            navigate(`/content/${result.item._id}`);
          }
          break;
        default:
          notifyError('This action is not configured yet.');
      }

      if (result && !result.success) {
        notifyError(result.message || 'Something went wrong while generating content.');
      }
    } catch (error) {
      notifyError(error.response?.data?.message || error.message || 'Something went wrong while generating content.');
    } finally {
      setGenerationAction(null);
    }
  };

  useEffect(() => {
    if (subjects.length === 0) fetchSubjects();
  }, []);

  const units = [
    { name: "Introduction & Fundamentals", status: "Completed", completed: true },
    { name: "Core Architecture & Design", status: "In Progress", completed: false },
    { name: "Advanced Implementations", status: "Not Started", completed: false },
    { name: "Case Studies & Analysis", status: "Not Started", completed: false },
    { name: "Revision & Final Review", status: "Not Started", completed: false },
  ];

  if (!subject) return (
    <DashboardLayout>
       <div className="h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
       </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* ── Breadcrumbs & Header ── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <button 
              onClick={() => navigate('/subjects')}
              className="flex items-center gap-2 text-slate-500 hover:text-violet-500 transition-colors text-xs font-bold uppercase tracking-widest mb-2"
            >
              <ChevronLeft size={16} /> Back to Library
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${subject.color} flex items-center justify-center shadow-lg shadow-black/10`}>
                <subject.icon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                  {subject.name}
                </h1>
                <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{subject.code} · Academy Workspace</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white dark:bg-white/4 p-3 rounded-2xl border border-gray-100 dark:border-white/8 flex items-center gap-4">
                <div className="text-right">
                    <div className="text-xs font-black text-gray-900 dark:text-white">{subject.progress}%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Overall Progress</div>
                </div>
                <div className="w-24 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${subject.progress}%` }} className={`h-full bg-linear-to-r ${subject.color}`} />
                </div>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ── Left Sidebar: Units ── */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Syllabus Units</h3>
            {units.map((unit, i) => (
              <UnitCard 
                key={i} 
                unit={unit} 
                index={i} 
                isActive={selectedUnit === i} 
                onClick={() => setSelectedUnit(i)} 
              />
            ))}
            
            <button className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-slate-400 hover:text-violet-500 hover:border-violet-500 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest mt-6">
                <Plus size={16} /> Edit Syllabus
            </button>
          </div>

          {/* ── Main Workspace ── */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* Unit Header */}
            <motion.div
              key={selectedUnit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-linear-to-br from-violet-600 to-indigo-700 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Brain size={160} />
              </div>
              <div className="relative z-10 space-y-6 max-w-xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    <Activity size={12} /> Currently Studying
                 </div>
                 <h2 className="text-4xl font-black tracking-tight leading-tight">
                    Unit {selectedUnit + 1}: <br />
                    {units[selectedUnit].name}
                 </h2>
                 <p className="text-white/70 text-sm font-medium leading-relaxed">
                    Master the core concepts of this unit using our AI-driven study tools. Generate tailored notes or test your knowledge with revision quizzes.
                 </p>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">45m Est. Study</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                        <HelpCircle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">12 Topics</span>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* AI Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <motion.button
                 whileHover={{ y: -8, scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 disabled={isGenerating || contentLoading}
                  onClick={() => runGeneration('notes')}
                 className={`group relative bg-linear-to-br from-violet-600 to-indigo-700 rounded-4xl p-8 text-left transition-all shadow-2xl shadow-violet-500/30 overflow-hidden ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
               >
                 <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform">
                    <Sparkles size={100} />
                 </div>
                 <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-inner">
                      {isGenerating ? <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" /> : <FileText size={28} className="text-white" />}
                    </div>
                    <h4 className="text-xl font-black text-white mb-2 tracking-tight">AI Unit Notes</h4>
                    <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">Generate detailed specialized notes covering every topic in this unit instantly.</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            {isGenerating ? 'Generating...' : 'Build Notes'} <Zap size={10} className="inline ml-1" />
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-violet-600 transition-colors">
                            <ChevronRight size={16} />
                        </div>
                    </div>
                 </div>
               </motion.button>

               <ActionButton 
                 label="Practice Quiz" 
                 icon={Brain} 
                 color="bg-emerald-500" 
                 description="Test your understanding with 10 AI-generated multiple choice questions."
                 onClick={() => runGeneration('quiz')}
                 disabled={isGenerating || quizLoading}
               />
               <ActionButton 
                 label="Unit Report" 
                 icon={Target} 
                 color="bg-indigo-500" 
                 description="Get a structured summary including key terms and predicted exam questions."
                 onClick={() => runGeneration('report')}
                 disabled={isGenerating || contentLoading}
               />
            </div>

            {/* Resources Footer */}
            <div className="bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/6 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-violet-500 shadow-sm">
                        <MessageSquare size={24} />
                    </div>
                    <div>

                    <GenerationOverlay
                      open={isGenerating}
                      fullscreen
                      accent={generationAction === 'quiz' ? 'emerald' : generationAction === 'report' ? 'blue' : 'violet'}
                      title={generationAction === 'quiz' ? 'Generating quiz' : generationAction === 'report' ? 'Building report' : 'Generating notes'}
                      description={generationAction === 'quiz' ? 'The backend is preparing your quiz questions.' : generationAction === 'report' ? 'The backend is compiling your report structure.' : 'The backend is formatting your notes with a cleaner layout.'}
                    />
                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none mb-1">Study Chat</h4>
                        <p className="text-gray-400 text-xs font-medium">Have questions? Ask the AcadBuddy AI assistant about this unit.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white font-black text-sm hover:bg-gray-50 dark:hover:bg-white/15 transition-all shadow-sm">
                    Open Assistant
                </button>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default SubjectWorkspace;