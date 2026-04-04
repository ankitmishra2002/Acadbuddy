import { create } from 'zustand';
import api from '../services/api';

const useAdminStore = create((set) => ({
  users: [],
  posts: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/users');
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', loading: false });
    }
  },

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/posts');
      set({ posts: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch posts', loading: false });
    }
  },

  toggleUserBlock: async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/block`);
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? { ...u, status: response.data.user.status } : u)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  togglePostBlock: async (id) => {
    try {
      const response = await api.put(`/admin/posts/${id}/block`);
      set((state) => ({
        posts: state.posts.map((p) => (p._id === id ? { ...p, status: response.data.post.status } : p)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  deletePost: async (id) => {
    try {
      await api.delete(`/admin/posts/${id}`);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },
}));

export default useAdminStore;
