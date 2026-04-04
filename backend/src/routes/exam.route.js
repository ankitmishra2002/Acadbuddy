import express from 'express';
import {
  generateExamBlueprint,
  generateRevisionPlanner,
  generateRapidRevisionSheets,
  generateMockPaper,
  getExamPlans
} from '../controllers/exam.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/blueprint', authenticateAccessToken, generateExamBlueprint);
router.post('/planner', authenticateAccessToken, generateRevisionPlanner);
router.post('/rapid-sheets', authenticateAccessToken, generateRapidRevisionSheets);
router.post('/mock-paper', authenticateAccessToken, generateMockPaper);
router.get('/plans/:subjectId', authenticateAccessToken, getExamPlans);

export default router;

