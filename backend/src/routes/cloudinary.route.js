import express from 'express';
import {
  uploadFromBrowser,
  uploadMultiple,
  deleteFile,
  getConfig,
  upload
} from '../../../../controllers/cloudinary.controller.js';
import { authenticateAccessToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get Cloudinary configuration status (public endpoint for checking setup)
router.get('/config', getConfig);

// Upload single file (requires authentication)
router.post('/upload', authenticateAccessToken, upload.single('file'), uploadFromBrowser);

// Upload multiple files (requires authentication)
router.post('/upload-multiple', authenticateAccessToken, upload.array('files', 10), uploadMultiple);

// Delete file (requires authentication)
router.delete('/delete/:public_id', authenticateAccessToken, deleteFile);

export default router;

