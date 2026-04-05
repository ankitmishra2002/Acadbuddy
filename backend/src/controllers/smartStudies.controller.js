import multer from 'multer';
import GeneratedContent from '../models/GeneratedContent.model.js';
import { runSmartStudiesAnalysis } from '../services/smartStudies.service.js';
import { resolveSubjectForGeneratedContent } from '../utils/workspaceSubject.js';

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

    const rawSubjectId =
      typeof req.body?.subjectId === 'string' && req.body.subjectId.trim()
        ? req.body.subjectId.trim()
        : null;
    const subject = await resolveSubjectForGeneratedContent(req.userId, rawSubjectId);

    const fileLabel = (req.file.originalname || 'document').slice(0, 120);
    const titleBase =
      mode === 'summarize'
        ? `Smart study · Summary · ${fileLabel}`
        : `Smart study · Keywords · ${fileLabel}`;

    const storedContent = {
      ...data,
      fileName: req.file.originalname || '',
      mimeType: req.file.mimetype,
    };

    const topic =
      mode === 'summarize'
        ? (topicsDetails || '').trim().slice(0, 120) || fileLabel
        : (keywordFocus || '').trim().slice(0, 120) || fileLabel;

    const doc = new GeneratedContent({
      userId: req.userId,
      subjectId: subject._id,
      type: 'smart_study',
      title: titleBase.slice(0, 200),
      topic: topic || 'Smart Studies',
      content: storedContent,
      contextUsed: [],
      metadata: {
        generatedAt: new Date(),
        depth: mode,
      },
    });
    await doc.save();

    return res.json({ ...data, savedContentId: doc._id });
  } catch (error) {
    console.error('Smart Studies error:', error);
    return res.status(500).json({
      message: error.message || 'Smart Studies analysis failed',
    });
  }
};
