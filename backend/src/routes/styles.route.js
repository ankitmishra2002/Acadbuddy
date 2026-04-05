import express from 'express';
import {
  getUserStyles,
  getDefaultStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  activateStyle
} from '../controllers/style.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateAccessToken, getUserStyles);
router.get('/defaults', authenticateAccessToken, getDefaultStyles);
router.post('/', authenticateAccessToken, createStyle);
/** Unambiguous path (avoids any router ambiguity with /:id/activate) */
router.post('/activate/:id', authenticateAccessToken, activateStyle);
router.put('/:id/activate', authenticateAccessToken, activateStyle);
router.put('/:id', authenticateAccessToken, updateStyle);
router.delete('/:id', authenticateAccessToken, deleteStyle);

export default router;

