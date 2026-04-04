import { create } from 'zustand';
import api from '../services/api';

const useContentStore = create((set) => ({
  contents: [],
  loading: false,
  error: null,

  fetchContentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/content/item/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch content', loading: false });
      return null;
    }
  },

  generateNotes: async (subjectId, topic, options = {}) => {
    set({ loading: true });
    try {
      const response = await api.post('/content/notes', { subjectId, topic, ...options });
      set({ loading: false });
      return { success: true, item: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  generateReport: async (subjectId, topic, options = {}) => {
    set({ loading: true });
    try {
      const response = await api.post('/content/report', { 
        subjectId, 
        topic,
        wordCount: 1500,
        requiredSections: ['Abstract', 'Introduction', 'Core Technical Analysis', 'Impact', 'Conclusion'],
        ...options
      });
      set({ loading: false });
      return { success: true, item: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  generatePPT: async (subjectId, topic, options = {}) => {
    set({ loading: true });
    try {
      const response = await api.post('/content/ppt', { 
        subjectId, 
        topic,
        slideCount: 10,
        presentationType: 'academic',
        ...options
      });
      set({ loading: false });
      return { success: true, item: response.data };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteContent: async (id) => {
    try {
      await api.delete(`/content/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}));

export default useContentStore;
