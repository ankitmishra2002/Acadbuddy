import mongoose from 'mongoose';
import pdfParse from 'pdf-parse';
import Context from '../models/Context.model.js';
import https from 'https';
import http from 'http';

export const getContextsBySubject = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.userId, subjectId: req.params.subjectId };
    if (type) query.type = type;

    const contexts = await Context.find(query).sort({ createdAt: -1 });
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const extractFileContent = async (file) => {
  if (!file) {
    return '';
  }
  if (file.mimetype === 'application/pdf') {
    const pdfData = await pdfParse(file.buffer);
    return pdfData.text;
  }
  return file.buffer.toString('utf-8');
};

export const createContext = async (req, res) => {
  try {
    const { subjectId, type, title, content, topic, keywords } = req.body;

    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid or missing subject ID' });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let extractedContent = content || '';
    let fileUrl = null;

    // Check if content contains Cloudinary URL
    if (content && content.includes('[Cloudinary File]')) {
      const urlMatch = content.match(/URL:\s*(https?:\/\/[^\s]+)/);

      if (urlMatch) {
        fileUrl = urlMatch[1];
        extractedContent = fileUrl;
      }
    } else if (req.file) {
      try {
        extractedContent = await extractFileContent(req.file);
      } catch {
        return res.status(400).json({ message: 'Failed to parse uploaded file' });
      }
    }

    extractedContent = typeof extractedContent === 'string' ? extractedContent.trim() : '';

    if (!extractedContent) {
      return res.status(400).json({
        message:
          'No readable content. For PDFs, use a file with selectable text (scanned-only PDFs often extract as empty), or paste text in the Content field. For images, describe or paste content in Content.',
      });
    }

    const context = new Context({
      userId: req.userId,
      subjectId,
      type,
      title: String(title).trim(),
      content: extractedContent,
      fileUrl,
      metadata: {
        uploadDate: new Date(),
        topic: topic || '',
        keywords: keywords ? String(keywords).split(',').map((k) => k.trim()).filter(Boolean) : [],
      },
    });

    await context.save();
    res.status(201).json(context);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid subject or field format' });
    }
    console.error('createContext:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateContext = async (req, res) => {
  try {
    const context = await Context.findOne({ _id: req.params.id, userId: req.userId });
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }

    Object.assign(context, req.body);
    await context.save();
    res.json(context);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContext = async (req, res) => {
  try {
    const context = await Context.findOne({ _id: req.params.id, userId: req.userId });
    if (!context) {
      return res.status(404).json({ message: 'Context not found' });
    }

    await Context.deleteOne({ _id: req.params.id });
    res.json({ message: 'Context deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchContext = async (req, res) => {
  try {
    const { keyword } = req.query;
    const contexts = await Context.find({
      userId: req.userId,
      subjectId: req.params.subjectId,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { 'metadata.keywords': { $in: [new RegExp(keyword, 'i')] } }
      ]
    });
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Helper: extract the best URL from context ─────────────────────────────────
const extractContextFileUrl = (context) => {
  if (context.fileUrl && context.fileUrl.startsWith('http')) return context.fileUrl;
  if (context.content && context.content.startsWith('http')) return context.content;
  if (context.content && context.content.includes('[Cloudinary File]')) {
    const m = context.content.match(/URL:\s*(https?:\/\/[^\s]+)/);
    if (m) return m[1];
  }
  return null;
};

// ── GET /api/context/:id/proxy ─────────────────────────────────────────────────
// Server-side proxy: fetches file from Cloudinary and streams to browser.
// Bypasses client-side DNS / firewall blocks on res.cloudinary.com.
export const proxyContextFile = async (req, res) => {
  try {
    const context = await Context.findOne({ _id: req.params.id, userId: req.userId });
    if (!context) return res.status(404).json({ message: 'Context not found' });

    const fileUrl = extractContextFileUrl(context);
    if (!fileUrl) {
      return res.status(404).json({ message: 'No file attached to this context' });
    }

    const download = req.query.download === '1';
    const filename = fileUrl.split('/').pop().split('?')[0] || context.title || 'file';

    const protocol = fileUrl.startsWith('https') ? https : http;

    protocol.get(fileUrl, (upstream) => {
      if (upstream.statusCode >= 400) {
        return res.status(upstream.statusCode).json({ message: 'Failed to fetch file from cloud storage' });
      }

      const contentType = upstream.headers['content-type'] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      }

      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }

      upstream.pipe(res);
      upstream.on('error', (err) => {
        console.error('Upstream stream error:', err);
        if (!res.headersSent) res.status(500).json({ message: 'File stream error' });
      });
    }).on('error', (err) => {
      console.error('Proxy fetch error:', err);
      res.status(502).json({ message: 'Could not reach cloud file storage: ' + err.message });
    });
  } catch (error) {
    console.error('proxyContextFile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/context/:id/content ──────────────────────────────────────────────
// Returns the extracted text content for in-app viewing / markdown download.
export const serveContextContent = async (req, res) => {
  try {
    const context = await Context.findOne({ _id: req.params.id, userId: req.userId });
    if (!context) return res.status(404).json({ message: 'Context not found' });

    // If content is a URL or Cloudinary block, tell frontend to use proxy instead
    const isFileRef = extractContextFileUrl(context) !== null &&
      (context.content.startsWith('http') || context.content.includes('[Cloudinary File]'));

    res.json({
      title: context.title,
      type: context.type,
      hasFile: !!extractContextFileUrl(context),
      isFileRef,
      text: isFileRef ? null : context.content,
      proxyUrl: extractContextFileUrl(context) ? `/api/context/${context._id}/proxy` : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
