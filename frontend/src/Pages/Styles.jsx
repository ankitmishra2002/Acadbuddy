import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit, Layers, Settings, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Styles = () => {
  const toast = useToast();
  const [styles, setStyles] = useState([]);
  const [defaults, setDefaults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sections: [],
    tone: 'formal_exam',
    maxWordCount: '',
    approximateLength: 'medium',
    instructions: ''
  });
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    fetchStyles();
    fetchDefaults();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await api.get('/styles');
      setStyles(response.data);
    } catch (error) {
      console.error('Failed to fetch styles:', error);
    }
  };

  const fetchDefaults = async () => {
    try {
      const response = await api.get('/styles/defaults');
      setDefaults(response.data);
    } catch (error) {
      console.error('Failed to fetch defaults:', error);
    }
  };

  const handleUseDefault = async (defaultStyle) => {
    try {
      await api.post('/styles', {
        ...defaultStyle,
        isDefault: false
      });
      fetchStyles();
    } catch (error) {
      toast.error('Failed to create style');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStyle) {
        await api.put(`/styles/${editingStyle._id}`, formData);
      } else {
        await api.post('/styles', formData);
      }
      setShowModal(false);
      setEditingStyle(null);
      setFormData({
        name: '',
        sections: [],
        tone: 'formal_exam',
        maxWordCount: '',
        approximateLength: 'medium',
        instructions: ''
      });
      fetchStyles();
      toast.success(editingStyle ? 'Style updated.' : 'Style saved.');
    } catch (error) {
      toast.error('Failed to save style');
    }
  };

  const handleEdit = (style) => {
    setEditingStyle(style);
    setFormData({
      name: style.name,
      sections: style.sections,
      tone: style.tone,
      maxWordCount: style.maxWordCount || '',
      approximateLength: style.approximateLength || 'medium',
      instructions: style.instructions || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this style?')) return;
    try {
      await api.delete(`/styles/${id}`);
      fetchStyles();
    } catch (error) {
      toast.error('Failed to delete style');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/styles/${id}/activate`);
      fetchStyles();
    } catch (error) {
      toast.error('Failed to activate style');
    }
  };

  const addSection = () => {
    if (newSection.trim()) {
      setFormData({
        ...formData,
        sections: [...formData.sections, newSection.trim()]
      });
      setNewSection('');
    }
  };

  const removeSection = (index) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-8"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center px-1">
        <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-800 dark:from-indigo-400 dark:via-blue-400 dark:to-white tracking-tighter pb-1 drop-shadow-sm">
          Answer Styles
        </h1>
        <button
          onClick={() => {
            setEditingStyle(null);
            setFormData({
              name: '',
              sections: [],
              tone: 'formal_exam',
              maxWordCount: '',
              approximateLength: 'medium',
              instructions: ''
            });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Create Custom Style</span>
        </button>
      </motion.div>

      {/* Default Styles */}
      {defaults.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Layers size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Default Presets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaults.map((style, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all group flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3 group-hover:text-blue-600 transition-colors">{style.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tone</span>
                    <span className="text-xs bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium px-2 py-1 rounded-md">
                      {style.tone.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                     <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Structure</span>
                     <div className="flex flex-wrap gap-1.5">
                       {style.sections.slice(0, 4).map((sec, i) => (
                         <span key={i} className="text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md shadow-sm">
                           {sec}
                         </span>
                       ))}
                       {style.sections.length > 4 && (
                          <span className="text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-400 px-2 py-1 text-center flex items-center rounded-md shadow-sm">
                            +{style.sections.length - 4}
                          </span>
                       )}
                     </div>
                  </div>
                </div>
                <button
                  onClick={() => handleUseDefault(style)}
                  className="w-full mt-6 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-600 hover:border-blue-200 dark:hover:border-slate-500 hover:text-blue-700 dark:hover:text-white transition-all flex justify-center items-center gap-2"
                >
                  Use This Preset
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* User Styles */}
      <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2 px-1">
            <Settings size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">My Custom Styles</h2>
        </div>
        
        {styles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center">
             <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4 shadow-inner">
               <FileText size={32} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">No custom styles yet. Create one or use a default preset to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <motion.div 
                variants={itemVariants}
                key={style._id} 
                className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border ${style.isDefault ? 'border-emerald-200 dark:border-emerald-800 shadow-emerald-500/5' : 'border-white dark:border-slate-800'} p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col h-full`}
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{style.name}</h3>
                    {style.isDefault && (
                      <span className="flex-shrink-0 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">Tone</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium border border-slate-200 dark:border-slate-600">
                        {style.tone.replace('_', ' ')}
                      </span>
                    </div>
                    {style.approximateLength && (
                       <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">Length</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg font-medium capitalize border border-slate-200 dark:border-slate-600">
                          {style.approximateLength}
                        </span>
                      </div>
                    )}
                    <div>
                       <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Sections</span>
                       <div className="flex flex-wrap gap-1.5">
                         {style.sections.map((section, idx) => (
                           <span key={idx} className="text-[11px] font-medium bg-blue-50 dark:bg-blue-900/40 border border-blue-100/50 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md shadow-sm">
                             {section}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleActivate(style._id)}
                    disabled={style.isDefault}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm flex items-center justify-center gap-1.5 font-semibold transition-all ${
                      style.isDefault 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed hidden' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50'
                    }`}
                  >
                    <Check size={16} strokeWidth={3} />
                    Set Active
                  </button>
                  <button
                    onClick={() => handleEdit(style)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 transition-all"
                    title="Edit Style"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(style._id)}
                    disabled={style.isDefault}
                    className={`p-2.5 rounded-xl border transition-all ${
                      style.isDefault
                      ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 border-slate-100 dark:border-slate-700 cursor-not-allowed hidden'
                      : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200 dark:border-slate-700 hover:border-rose-200'
                    }`}
                    title={style.isDefault ? "Cannot delete active style" : "Delete Style"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-white dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Settings size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {editingStyle ? 'Edit Style Profile' : 'Create Custom Style'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Style Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. In-depth Explanation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                      Tone <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="formal_exam">Formal Exam</option>
                      <option value="conceptual">Conceptual Learning</option>
                      <option value="casual">Casual / Conversational</option>
                      <option value="academic">Strictly Academic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">
                    Document Sections <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 mb-2">Define the structure blocks the AI should generate (e.g. Introduction, Core Concepts, Conclusion).</p>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
                      placeholder="Type a section name and hit enter"
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={addSection}
                      className="bg-slate-200 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl hover:bg-slate-300 font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 rounded-xl">
                    {formData.sections.length === 0 && (
                       <span className="text-sm text-slate-400 italic font-medium my-auto mx-auto">No sections added yet</span>
                    )}
                    {formData.sections.map((section, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-sm shadow-sm"
                      >
                        {section}
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="text-blue-400 hover:text-rose-500 transition-colors p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                      Max Word Count <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={formData.maxWordCount}
                      onChange={(e) => setFormData({ ...formData, maxWordCount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                      Approximate Length
                    </label>
                    <select
                      value={formData.approximateLength}
                      onChange={(e) => setFormData({ ...formData, approximateLength: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 appearance-none"
                    >
                      <option value="short">Short & Concise</option>
                      <option value="medium">Medium</option>
                      <option value="detailed">Very Detailed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    System Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Provide additional prompt rules to the AI..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium text-slate-800 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStyle(null);
                    }}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold transition-all pt-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formData.sections.length === 0}
                    className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 font-semibold transition-all transform hover:-translate-y-0.5"
                  >
                    {editingStyle ? 'Save Changes' : 'Create Style Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Styles;
