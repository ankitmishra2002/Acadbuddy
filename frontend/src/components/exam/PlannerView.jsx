import { useState } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PlannerView = ({ subjectId, examPlan, onUpdate }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    examDate: '',
    hoursPerDay: 3
  });
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!examPlan?.blueprint) {
      toast.warning('Generate an exam blueprint first.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/exam/planner', {
        subjectId,
        ...formData
      });
      onUpdate();
    } catch (error) {
      toast.error('Failed to generate planner: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Revision Planner</h3>

      {!examPlan?.blueprint && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 p-5 rounded-xl font-medium flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          Please generate an exam blueprint first before creating a revision planner.
        </div>
      )}

      <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Exam Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.examDate}
            onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Hours Per Day
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={formData.hoursPerDay}
            onChange={(e) => setFormData({ ...formData, hoursPerDay: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !examPlan?.blueprint}
          className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles size={20} />
          {loading ? 'Generating...' : 'Generate Planner'}
        </button>
      </form>

      {examPlan?.revisionPlan?.days?.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 sm:p-8 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/50 shadow-sm transition-all">
          <h4 className="text-2xl font-extrabold mb-6 text-emerald-800 dark:text-emerald-300 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Revision Schedule
          </h4>
          <div className="space-y-4">
            {examPlan.revisionPlan.days.map((day, index) => (
              <div key={index} className="bg-white dark:bg-emerald-900/40 p-5 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-emerald-100/50 dark:border-emerald-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-md">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 bg-emerald-100/50 dark:bg-emerald-900/50 inline-block px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                      Topics: <span className="text-slate-700 dark:text-slate-300 font-bold">{day.topics.join(', ')}</span>
                    </p>
                    {day.tasks && day.tasks.length > 0 && (
                      <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1.5 ml-1">
                        {day.tasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/80 px-3 py-1 rounded-lg">
                    {day.hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
          {examPlan.revisionPlan.mockTestDays && examPlan.revisionPlan.mockTestDays.length > 0 && (
            <div className="mt-8 pt-6 border-t border-emerald-200 dark:border-emerald-800/50">
              <p className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Mock Test Days:
              </p>
              <div className="flex flex-wrap gap-2">
                {examPlan.revisionPlan.mockTestDays.map((date, index) => (
                  <span key={index} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800/50 text-sm shadow-sm transition-all hover:-translate-y-0.5">
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlannerView;

