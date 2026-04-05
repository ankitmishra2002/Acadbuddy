import express from 'express';
import {
  generateExamBlueprint,
  generateRevisionPlanner,
  generateRapidRevisionSheets,
  generateQuickRevision,
  generateMockPaper,
  getExamPlans
} from '../controllers/exam.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/blueprint', authenticateAccessToken, generateExamBlueprint);
router.post('/planner', authenticateAccessToken, generateRevisionPlanner);
router.post('/rapid-sheets', authenticateAccessToken, generateRapidRevisionSheets);
router.post('/quick-revision', authenticateAccessToken, generateQuickRevision);
router.post('/mock-paper', authenticateAccessToken, generateMockPaper);
router.get('/plans/:subjectId', authenticateAccessToken, getExamPlans);

export default router;

