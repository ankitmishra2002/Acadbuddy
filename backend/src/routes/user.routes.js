import express from 'express';
import {
  getRecentContent,
  getUserProfile,
  getUserProgress,
  updateUserProfile
} from '../controllers/user.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', authenticateAccessToken, getUserProfile);
router.put('/profile', authenticateAccessToken, updateUserProfile);
router.get('/progress', authenticateAccessToken, getUserProgress);
router.get('/recent-content', authenticateAccessToken, getRecentContent);

export default router;