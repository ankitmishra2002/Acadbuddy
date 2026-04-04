import express from 'express';
import {
  getQuizzes,
  createQuiz,
  submitQuizAttempt,
  getQuizAnalytics
} from '../controllers/quiz.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:subjectId', authenticateAccessToken, getQuizzes);
router.post('/', authenticateAccessToken, createQuiz);
router.post('/attempt', authenticateAccessToken, submitQuizAttempt);
router.get('/analytics/:subjectId', authenticateAccessToken, getQuizAnalytics);

export default router;

