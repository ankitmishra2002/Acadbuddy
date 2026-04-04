import { useEffect, useRef, useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import api from '../../services/api';
import GenerationOverlay from '../ui/GenerationOverlay';

const RapidSheetsGenerator = ({ subjectId }) => {
  const [formData, setFormData] = useState({
    topics: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const outputRef = useRef(null);

  useEffect(() => {
    if (generatedContent && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedContent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const topicsArray = formData.topics.split(',').map(t => t.trim()).filter(t => t);
      const response = await api.post('/exam/rapid-sheets', {
        subjectId,
        topics: topicsArray.length > 0 ? topicsArray : undefined
      });
      setGeneratedContent(response.data);
    } catch (error) {
      alert('Failed to generate revision sheets: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-8">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Rapid Revision Sheets</h3>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Topics <span className="text-slate-400 font-normal ml-1">(comma-separated, leave empty for all topics)</span>
          </label>
          <input
            type="text"
            value={formData.topics}
            onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
            placeholder="e.g., Arrays, Linked Lists, Trees"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles size={20} />
          {loading ? 'Generating...' : 'Generate Revision Sheets'}
        </button>
      </form>

      {generatedContent && (
        <div ref={outputRef} className="bg-purple-50 dark:bg-slate-950/70 p-6 sm:p-8 rounded-4xl border border-purple-100 dark:border-purple-800/60 shadow-sm transition-all focus-within:ring-2 focus-within:ring-purple-500">
          <h4 className="text-2xl font-extrabold mb-8 text-purple-800 dark:text-purple-300 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            {generatedContent.title}
          </h4>
          
          {generatedContent.content.keyPoints && (
            <div className="bg-white dark:bg-purple-900/40 p-5 sm:p-7 rounded-2xl border border-purple-100/50 dark:border-purple-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6">
              <h5 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-purple-500">⚡</span> Key Points
              </h5>
              <ul className="list-disc list-outside ml-5 space-y-2">
                {generatedContent.content.keyPoints.map((point, index) => (
                  <li key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {generatedContent.content.formulae && generatedContent.content.formulae.length > 0 && (
            <div className="bg-slate-900 dark:bg-slate-900/80 p-5 sm:p-7 rounded-2xl border border-slate-700 border-l-4 border-l-purple-500 mb-6 group transition-all hover:shadow-lg">
              <h5 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">∑</span> Formulae
              </h5>
              <ul className="list-none space-y-3">
                {generatedContent.content.formulae.map((formula, index) => (
                  <li key={index} className="font-mono text-purple-200 bg-slate-800/50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/50">{formula}</li>
                ))}
              </ul>
            </div>
          )}
          
          {generatedContent.content.definitions && generatedContent.content.definitions.length > 0 && (
            <div className="bg-white dark:bg-purple-900/40 p-5 sm:p-7 rounded-2xl border border-purple-100/50 dark:border-purple-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <h5 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-purple-500">📖</span> Definitions
              </h5>
              <div className="space-y-4">
                {generatedContent.content.definitions.map((def, index) => (
                  <div key={index} className="border-l-4 border-purple-400 bg-purple-50/50 dark:bg-purple-900/20 pl-4 py-3 pr-3 rounded-r-xl transition-all hover:bg-purple-50 dark:hover:bg-purple-900/40">
                    <strong className="text-slate-800 dark:text-slate-100 text-base">{def.term}:</strong> 
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GenerationOverlay
        open={loading}
        title="Generating revision sheets"
        description="The backend is condensing topics into a fast revision format."
        accent="amber"
      />
    </div>
  );
};

export default RapidSheetsGenerator;

