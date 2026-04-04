import multer from 'multer';
import { runSmartStudiesAnalysis } from '../services/smartStudies.service.js';

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or PDF files are allowed.'));
    }
  },
}).single('file');

export const runSmartStudies = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'No file uploaded. Send multipart field "file".' });
    }

    const mode = req.body?.mode;

    if (mode !== 'summarize' && mode !== 'keywords') {
      return res.status(400).json({ message: 'Invalid or missing mode. Use "summarize" or "keywords".' });
    }

    const topicsDetails =
      typeof req.body?.topicsDetails === 'string' ? req.body.topicsDetails : '';
    const rawWords = parseInt(String(req.body?.targetWordCount ?? ''), 10);
    const targetWordCount = Number.isFinite(rawWords) && rawWords > 0 ? rawWords : 400;
    const keywordFocus =
      typeof req.body?.keywordFocus === 'string'
        ? req.body.keywordFocus
        : typeof req.body?.context === 'string'
          ? req.body.context
          : '';

    const data = await runSmartStudiesAnalysis({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      mode,
      topicsDetails,
      targetWordCount,
      keywordFocus,
    });

    return res.json(data);
  } catch (error) {
    console.error('Smart Studies error:', error);
    return res.status(500).json({
      message: error.message || 'Smart Studies analysis failed',
    });
  }
};
