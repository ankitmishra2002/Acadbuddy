import { create } from 'zustand';
import api from '../services/api';
import { BookOpen, Layers, TrendingUp, Star, GraduationCap, Code, Cpu, Database } from 'lucide-react';

const AESTHETIC_TEMPLATES = [
  { color: 'from-blue-500 to-indigo-600', icon: BookOpen },
  { color: 'from-violet-500 to-fuchsia-600', icon: Layers },
  { color: 'from-emerald-500 to-teal-600', icon: TrendingUp },
  { color: 'from-orange-500 to-rose-600', icon: Star },
  { color: 'from-cyan-500 to-blue-600', icon: GraduationCap },
  { color: 'from-pink-500 to-rose-500', icon: Code },
  { color: 'from-amber-500 to-orange-600', icon: Cpu },
  { color: 'from-indigo-500 to-purple-600', icon: Database },
];

const useSubjectStore = create((set, get) => ({
  subjects: [],
  loading: false,
  error: null,

  fetchSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/subjects');
      // Mix in aesthetic templates based on index or ID
      const enrichedSubjects = response.data.map((subject, index) => {
        const template = AESTHETIC_TEMPLATES[index % AESTHETIC_TEMPLATES.length];
        return {
          ...subject,
          ...template,
          progress: Math.floor(Math.random() * 60) + 20, // Mock progress for now as requested
          units: Math.floor(Math.random() * 5) + 1,
          questions: Math.floor(Math.random() * 50) + 10,
        };
      });
      set({ subjects: enrichedSubjects, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch subjects', loading: false });
    }
  },

  addSubject: async (name, code) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/subjects', { name, code });
      const template = AESTHETIC_TEMPLATES[get().subjects.length % AESTHETIC_TEMPLATES.length];
      const newSubject = {
        ...response.data,
        ...template,
        progress: 0,
        units: 0,
        questions: 0,
      };
      set((state) => ({ 
        subjects: [...state.subjects, newSubject], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add subject', loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteSubject: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/subjects/${id}`);
      set((state) => ({
        subjects: state.subjects.filter(s => s._id !== id),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete subject', loading: false });
      return { success: false };
    }
  }
}));

export default useSubjectStore;
