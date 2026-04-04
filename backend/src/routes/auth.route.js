import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken
} from '../controllers/auth.controller.js';
import {
  authenticateAccessToken,
  authenticateRefreshToken
} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', authenticateRefreshToken, refreshAccessToken);
router.get('/me', authenticateAccessToken, getCurrentUser);

export default router;

