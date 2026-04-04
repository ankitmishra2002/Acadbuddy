import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  userLoading: false,
  error: null,

  login: async (email, password) => {
    set({ userLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, userLoading: false });
      return { success: true };
    } catch (error) {
      set({ userLoading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },

  register: async (userData) => {
    set({ userLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, userLoading: false });
      return { success: true };
    } catch (error) {
      set({ userLoading: false });
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, userLoading: false });
      return { success: false };
    }
    set({ userLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, userLoading: false });
      return { success: true };
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, userLoading: false });
      return { success: false };
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  clearUser: () => set({ user: null, isAuthenticated: false, userLoading: false }),
}));

export default useAuthStore;
