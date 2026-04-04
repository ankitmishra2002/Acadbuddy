import { useState } from 'react';
import { Presentation } from 'lucide-react';
import api from '../../services/api';

const PPTGenerator = ({ subjectId }) => {
  const [formData, setFormData] = useState({
    topic: '',
    slideCount: 10,
    presentationType: 'seminar',
    customPrompt: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/content/ppt', {
        subjectId,
        ...formData
      });
      setGeneratedContent(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        alert('AI service is not properly configured. Please contact the administrator.');
      } else {
        alert('Failed to generate PPT: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Generate PPT Content</h2>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/80 p-6 sm:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 backdrop-blur-xl space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Topic <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g., Database Management Systems"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Number of Slides
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={formData.slideCount}
            onChange={(e) => setFormData({ ...formData, slideCount: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Presentation Type
          </label>
          <select
            value={formData.presentationType}
            onChange={(e) => setFormData({ ...formData, presentationType: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
          >
            <option value="seminar">Seminar</option>
            <option value="viva">Viva</option>
            <option value="internal">Internal</option>
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
          <Presentation size={20} />
          {loading ? 'Generating PPT...' : 'Generate PPT'}
        </button>
      </form>

      {generatedContent && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 sm:p-8 rounded-[2rem] shadow-sm transform transition-all duration-300">
          <h3 className="text-2xl font-extrabold mb-8 text-indigo-800 dark:text-indigo-300 tracking-tight flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {generatedContent.title}
          </h3>
          <div className="space-y-6">
            {generatedContent.content.slides?.map((slide, index) => (
              <div key={index} className="bg-white dark:bg-indigo-900/40 p-5 sm:p-7 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border-l-4 border-l-indigo-500 transition-all hover:-translate-y-1 hover:shadow-lg">
                <h4 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Slide {index + 1}: {slide.title}</h4>
                <ul className="list-disc list-outside ml-5 mb-4 space-y-2">
                  {slide.bullets?.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{bullet}</li>
                  ))}
                </ul>
                {slide.speakerNotes && (
                  <div className="mt-5 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-sm text-slate-600 dark:text-slate-400 italic">
                    <strong className="text-indigo-700 dark:text-indigo-300 font-bold not-italic font-sans mb-1 block">Speaker Notes:</strong> {slide.speakerNotes}
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

export default PPTGenerator;

