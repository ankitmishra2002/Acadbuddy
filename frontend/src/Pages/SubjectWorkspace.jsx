import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, FileCheck, Presentation, GraduationCap, Brain, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import NotesGenerator from '../components/content/NotesGenerator';
import ReportGenerator from '../components/content/ReportGenerator';
import PPTGenerator from '../components/content/PPTGenerator';
import ExamMode from '../components/exam/ExamMode';
import ContextManager from '../components/content/ContextManager';
import ContentList from '../components/content/ContentList';

const SubjectWorkspace = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('context');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const response = await api.get(`/subjects/${id}`);
      setSubject(response.data);
    } catch (error) {
      console.error('Failed to fetch subject:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const tabs = [
    { id: 'context', label: 'Context', icon: FileText },
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'report', label: 'Reports', icon: FileCheck },
    { id: 'ppt', label: 'PPT', icon: Presentation },
    { id: 'exam', label: 'Exam Mode', icon: GraduationCap },
    { id: 'content', label: 'My Content', icon: Brain }
  ];

  return (
    <div className="space-y-8 w-full max-w-full pb-16 sm:pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full min-w-0 border-b border-transparent pb-1">
          <div className="flex items-start sm:items-center gap-3 mb-1.5">
            <Link 
              to="/subjects" 
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all hover:-translate-x-1 shrink-0 mt-1 sm:mt-0"
              title="Back to Subjects"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight break-words min-w-0 flex-1 leading-tight">{subject?.name}</h1>
          </div>
          {subject?.code && (
            <p className="text-slate-500 dark:text-slate-400 font-medium ml-12 sm:ml-14 flex items-center gap-2 text-sm sm:text-base">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0"></span> 
              <span className="truncate">Code: <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">{subject.code}</span></span>
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
        <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 min-w-max pb-1 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6 w-full max-w-full min-w-0">
        {activeTab === 'context' && <ContextManager subjectId={id} />}
        {activeTab === 'notes' && <NotesGenerator subjectId={id} />}
        {activeTab === 'report' && <ReportGenerator subjectId={id} />}
        {activeTab === 'ppt' && <PPTGenerator subjectId={id} />}
        {activeTab === 'exam' && <ExamMode subjectId={id} />}
        {activeTab === 'content' && <ContentList subjectId={id} />}
      </div>
    </div>
  );
};

export default SubjectWorkspace;

