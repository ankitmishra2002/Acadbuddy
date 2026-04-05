import express from 'express';
import multer from 'multer';
import {
  getContextsBySubject,
  createContext,
  updateContext,
  deleteContext,
  searchContext,
  proxyContextFile,
  serveContextContent
} from '../controllers/context.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ── Specific nested routes MUST come before wildcard /:subjectId ──────────────
router.get('/:id/search', authenticateAccessToken, searchContext);
router.get('/:id/proxy', authenticateAccessToken, proxyContextFile);
router.get('/:id/content', authenticateAccessToken, serveContextContent);

// ── Wildcard context routes ───────────────────────────────────────────────────
router.get('/:subjectId', authenticateAccessToken, getContextsBySubject);
router.post('/', authenticateAccessToken, upload.single('file'), createContext);
router.put('/:id', authenticateAccessToken, updateContext);
router.delete('/:id', authenticateAccessToken, deleteContext);

export default router;



