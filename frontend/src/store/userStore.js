import { create } from 'zustand';
import api from '../services/api';

const useUserStore = create((set) => ({
  stats: null,
  recentContent: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/users/progress');
      set({ stats: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch stats', loading: false });
    }
  },

  fetchRecentContent: async (limit = 5) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/users/recent-content?limit=${limit}`);
      set({ recentContent: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch recent content', loading: false });
    }
  },

  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put('/users/profile', userData);
      // Also update authStore if necessary, or just refetchUser
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update profile', loading: false });
      return { success: false, message: error.response?.data?.message };
    }
  }
}));

export default useUserStore;
