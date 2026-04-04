import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import api from '../../services/api';

const MockPaperGenerator = ({ subjectId }) => {
  const [formData, setFormData] = useState({
    shortCount: 5,
    longCount: 3
  });
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/exam/mock-paper', {
        subjectId,
        ...formData
      });
      setGeneratedContent(response.data);
    } catch (error) {
      alert('Failed to generate mock paper: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Mock Paper Generator</h3>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              Short Answer Questions
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={formData.shortCount}
              onChange={(e) => setFormData({ ...formData, shortCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
              Long Answer Questions
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.longCount}
              onChange={(e) => setFormData({ ...formData, longCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
            />
          </div>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles size={20} />
            {loading ? 'Generating...' : 'Generate Mock Paper'}
          </button>
        </div>
      </form>

      {generatedContent && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500">
          <h4 className="text-2xl font-extrabold mb-8 text-blue-800 dark:text-blue-300 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {generatedContent.title}
          </h4>
          <div className="space-y-6">
            {generatedContent.content.questions?.map((question, index) => (
              <div key={index} className="bg-white dark:bg-blue-900/40 p-5 sm:p-7 rounded-2xl border-l-4 border-l-blue-500 border-y border-r border-blue-100/50 dark:border-blue-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:shadow-md">
                <div className="flex items-start gap-3 mb-4">
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 text-xl">Q{index + 1}.</span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex-shrink-0 mt-0.5 ${
                    question.type === 'short' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/50' : 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-400 dark:border-violet-800/50'
                  }`}>
                    {question.type === 'short' ? 'Short Answer' : 'Long Answer'}
                  </span>
                </div>
                <p className="mb-5 text-slate-800 dark:text-slate-100 font-semibold text-lg leading-relaxed">{question.question}</p>
                {question.answer && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 transition-all">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Answer Guide</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">{question.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockPaperGenerator;

