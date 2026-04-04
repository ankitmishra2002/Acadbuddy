import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpen, Sparkles, FileText, Target } from 'lucide-react';

const SubjectWorkspace = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-500">
          <BookOpen size={40} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Subject Workspace</h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-sm">
            Select a unit from your syllabus to begin generating AI notes, mock papers, or revision plans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20">
            Generate Unit Notes
          </button>
          <button className="px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold rounded-xl transition-all">
            Open Chat
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubjectWorkspace;