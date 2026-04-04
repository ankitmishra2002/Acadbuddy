import express from 'express';
import {
  startSession,
  endSession,
  getSessions
} from '../controllers/session.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/start', authenticateAccessToken, startSession);
router.put('/:id/end', authenticateAccessToken, endSession);
router.get('/', authenticateAccessToken, getSessions);

export default router;

