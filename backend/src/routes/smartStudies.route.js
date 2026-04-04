import express from 'express';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';
import { uploadMiddleware, runSmartStudies } from '../controllers/smartStudies.controller.js';

const router = express.Router();

const uploadWithErrorHandling = (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.post('/run', authenticateAccessToken, uploadWithErrorHandling, runSmartStudies);

export default router;
