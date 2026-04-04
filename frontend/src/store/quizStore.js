import { create } from 'zustand';
import api from '../services/api';

const useQuizStore = create((set) => ({
    quizzes: [],
    loading: false,
    error: null,

    generateQuiz: async (subjectId, topic) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/quiz', {
                subjectId,
                topic,
                questionCount: 10,
                difficulty: 'medium'
            });
            set({ loading: false });
            return { success: true, quiz: response.data };
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to generate quiz', loading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchQuizzes: async (subjectId) => {
        set({ loading: true });
        try {
            const response = await api.get(`/quiz/${subjectId}`);
            set({ quizzes: response.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    submitAttempt: async (quizId, score, answers) => {
        try {
            const response = await api.post('/quiz/attempt', {
                quizId,
                score,
                answers
            });
            return { success: true, analytics: response.data };
        } catch (error) {
            return { success: false };
        }
    }
}));

export default useQuizStore;
