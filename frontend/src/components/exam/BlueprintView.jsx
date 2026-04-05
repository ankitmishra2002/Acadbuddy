import { useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const BlueprintView = ({ subjectId, examPlan, onUpdate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await api.post('/exam/blueprint', { subjectId });
      await onUpdate();
      toast.success('Exam blueprint generated.');
    } catch (error) {
      toast.error('Failed to generate blueprint: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Exam Blueprint</h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all w-full sm:w-auto"
        >
          <Sparkles size={18} />
          {loading ? 'Generating...' : 'Generate Blueprint'}
        </button>
      </div>

      {examPlan?.blueprint?.units?.length > 0 ? (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 sm:p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-all">
          <div className="space-y-5">
            {examPlan.blueprint.units.map((unit, index) => (
              <div key={index} className="bg-white dark:bg-indigo-900/40 p-5 sm:p-6 rounded-2xl border-l-4 border-l-indigo-500 border-y border-r border-indigo-100/50 dark:border-indigo-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{unit.name}</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-lg">
                      Weightage: {unit.weightage}%
                    </span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      unit.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400' :
                      unit.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-400'
                    }`}>
                      {(unit.difficulty || 'medium').toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Frequency: {unit.frequency != null ? unit.frequency : '—'} questions
                </p>
                {unit.importantTopics && unit.importantTopics.length > 0 && (
                  <div className="pt-4 border-t border-indigo-100 dark:border-indigo-800/40">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Important Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {unit.importantTopics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-900/20 dark:via-slate-900/80 dark:to-blue-900/20 p-12 sm:p-16 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-indigo-100/60 dark:border-indigo-800/40 backdrop-blur-xl text-center flex flex-col items-center justify-center transition-all hover:shadow-[0_8px_40px_rgb(59,130,246,0.08)]">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 shadow-xl shadow-indigo-200/40 dark:shadow-indigo-900/40 rounded-[1.5rem] flex items-center justify-center mb-8 border border-slate-50 dark:border-slate-700 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <TrendingUp size={48} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Master Your Subject</h4>
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg max-w-md mx-auto leading-relaxed">
            Generate an AI-powered blueprint instantly. Map out topic weightages, difficulties, and unlock your optimum study path.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlueprintView;

