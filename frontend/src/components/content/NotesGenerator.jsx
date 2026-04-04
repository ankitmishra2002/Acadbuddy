import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NotesGenerator = ({ subjectId }) => {
  const [formData, setFormData] = useState({
    topic: '',
    depth: 'medium',
    customPrompt: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/content/notes', {
        subjectId,
        ...formData
      });
      setGeneratedContent(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        alert('AI service is not properly configured. Please contact the administrator.');
      } else {
        alert('Failed to generate notes: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Generate Study Notes</h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Topic/Unit <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Data Structures, Operating Systems"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Depth Level
          </label>
          <select
            value={formData.depth}
            onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Special Details / Additional Instructions <span className="text-slate-400 font-normal ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.customPrompt}
            onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
            placeholder="Add any specific requirements, focus areas, or special instructions for the AI..."
            rows="4"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles size={20} />
          {loading ? 'Generating Notes...' : 'Generate Notes'}
        </button>
      </form>

      {generatedContent && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-6 sm:p-8 rounded-[2rem] shadow-sm transform transition-all duration-300">
          <h3 className="text-2xl font-extrabold mb-6 text-emerald-800 dark:text-emerald-300 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {generatedContent.title}
          </h3>
          <div className="space-y-5">
            {generatedContent.content.sections?.map((section, index) => (
              <div key={index} className="bg-white dark:bg-emerald-900/40 p-5 sm:p-6 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <h4 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100">{section.title}</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3 pt-6 border-t border-emerald-200 dark:border-emerald-800/50">
            <Link
              to={`/focus/notes/${generatedContent._id}`}
              className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              Open in Focus Mode
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesGenerator;

