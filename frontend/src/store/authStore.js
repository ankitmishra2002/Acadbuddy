import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      if (!accessToken || !refreshToken) {
        return { success: false, error: 'Invalid response from server' };
      }
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  },

  register: async (userData) => {
    try {
      // Validate required fields
      const requiredFields = ['email', 'password', 'name', 'university', 'college', 'branch', 'semester'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      if (missingFields.length > 0) {
        return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` };
      }

      const response = await api.post('/auth/register', userData);
      const { accessToken, refreshToken, user } = response.data;
      if (!accessToken || !refreshToken) {
        return { success: false, error: 'Invalid response from server' };
      }
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      // If token is invalid or user not logged in, silently clear it
      // Don't log 401 errors as they're expected when user isn't authenticated
      if (error.response?.status !== 401) {
        console.error('Failed to fetch user:', error);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      return { success: false };
    }
  }
}));

export default useAuthStore;

