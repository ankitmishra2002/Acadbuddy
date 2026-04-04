import { create } from 'zustand';
import api from '../services/api';

const useCommunityStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const { university, branch, semester } = filters;
      let url = '/community/posts';
      const params = new URLSearchParams();
      if (university) params.append('university', university);
      if (branch) params.append('branch', branch);
      if (semester) params.append('semester', semester);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      set({ posts: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch posts', loading: false });
    }
  },

  fetchPostById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/community/posts/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch post', loading: false });
      return null;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await api.post('/community/posts', postData);
      set((state) => ({ posts: [response.data, ...state.posts] }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  votePost: async (id, voteType) => {
    try {
      const response = await api.post(`/community/posts/${id}/vote`, { voteType });
      set((state) => ({
        posts: state.posts.map((p) => (p._id === id ? response.data : p)),
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  fetchComments: async (postId) => {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, { content });
      return { success: true, comment: response.data };
    } catch (error) {
      return { success: false };
    }
  },
}));

export default useCommunityStore;
