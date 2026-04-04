import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import {
  getContextsBySubject,
  createContext,
  updateContext,
  deleteContext,
  searchContext
} from '../controllers/context.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.get('/:subjectId/search', authenticateAccessToken, searchContext);
router.get('/:subjectId', authenticateAccessToken, getContextsBySubject);
router.post('/', authenticateAccessToken, upload.single('file'), createContext);
router.put('/:id', authenticateAccessToken, updateContext);
router.delete('/:id', authenticateAccessToken, deleteContext);

export default router;

