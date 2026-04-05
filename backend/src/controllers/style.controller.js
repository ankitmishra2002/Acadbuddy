import mongoose from 'mongoose';
import AnswerStyle from '../models/AnswerStyle.model.js';
import User from '../models/User.model.js';

const DEFAULT_STYLES = [
  {
    name: 'Formal Exam Style',
    sections: ['Definition', 'Explanation', 'Key Points', 'Conclusion'],
    tone: 'formal_exam',
    maxWordCount: 500,
    approximateLength: 'medium'
  },
  {
    name: 'Conceptual Learning',
    sections: ['Overview', 'Core Concepts', 'Examples', 'Applications', 'Summary'],
    tone: 'conceptual',
    maxWordCount: 800,
    approximateLength: 'detailed'
  },
  {
    name: 'Quick Revision',
    sections: ['Key Points', 'Formulae', 'Important Definitions'],
    tone: 'casual',
    maxWordCount: 300,
    approximateLength: 'short'
  }
];

function parseMaxWordCount(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function sanitizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((s) => String(s).trim()).filter(Boolean);
}

export const getUserStyles = async (req, res) => {
  try {
    const styles = await AnswerStyle.find({ userId: req.userId }).sort({ updatedAt: -1 });
    const user = await User.findById(req.userId).select('activeStyleProfileId');
    let activeId = user?.activeStyleProfileId?.toString();

    if (!activeId && styles.length > 0) {
      await User.findByIdAndUpdate(req.userId, { activeStyleProfileId: styles[0]._id });
      activeId = styles[0]._id.toString();
    }

    const payload = styles.map((doc) => {
      const o = doc.toObject();
      o.isActive = Boolean(activeId && doc._id.toString() === activeId);
      return o;
    });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDefaultStyles = async (_req, res) => {
  res.json(DEFAULT_STYLES);
};

export const createStyle = async (req, res) => {
  try {
    const sections = sanitizeSections(req.body.sections);
    if (!sections.length) {
      return res.status(400).json({ message: 'At least one section is required' });
    }
    if (!req.body.name || !String(req.body.name).trim()) {
      return res.status(400).json({ message: 'Style name is required' });
    }
    if (!req.body.tone) {
      return res.status(400).json({ message: 'Tone is required' });
    }

    const style = new AnswerStyle({
      userId: req.userId,
      name: String(req.body.name).trim(),
      sections,
      tone: req.body.tone,
      maxWordCount: parseMaxWordCount(req.body.maxWordCount),
      approximateLength: req.body.approximateLength || undefined,
      instructions: req.body.instructions ? String(req.body.instructions) : undefined,
      isDefault: Boolean(req.body.isDefault),
      isPublic: Boolean(req.body.isPublic)
    });
    await style.save();
    res.status(201).json(style);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStyle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid style id' });
    }
    const style = await AnswerStyle.findOne({ _id: req.params.id, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }

    const {
      name,
      sections,
      tone,
      maxWordCount,
      approximateLength,
      instructions,
      isDefault,
      isPublic
    } = req.body;

    if (name !== undefined) style.name = String(name).trim();
    if (sections !== undefined) {
      const next = sanitizeSections(sections);
      if (!next.length) {
        return res.status(400).json({ message: 'At least one section is required' });
      }
      style.sections = next;
    }
    if (tone !== undefined) style.tone = tone;
    if (maxWordCount !== undefined) style.maxWordCount = parseMaxWordCount(maxWordCount);
    if (approximateLength !== undefined) style.approximateLength = approximateLength || undefined;
    if (instructions !== undefined) style.instructions = instructions ? String(instructions) : undefined;
    if (isDefault !== undefined) style.isDefault = Boolean(isDefault);
    if (isPublic !== undefined) style.isPublic = Boolean(isPublic);

    await style.save();
    res.json(style);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStyle = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid style id' });
    }
    const style = await AnswerStyle.findOne({ _id: req.params.id, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }

    const user = await User.findById(req.userId);
    const deletingActive = user?.activeStyleProfileId?.toString() === req.params.id;

    await AnswerStyle.deleteOne({ _id: req.params.id });

    if (deletingActive && user) {
      const next = await AnswerStyle.findOne({ userId: req.userId }).sort({ updatedAt: -1 });
      user.activeStyleProfileId = next?._id || null;
      await user.save();
    }

    res.json({ message: 'Style profile deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateStyle = async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!rawId || typeof rawId !== 'string') {
      return res.status(400).json({ message: 'Style id is required' });
    }

    const style = await AnswerStyle.findOne({ _id: rawId, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.activeStyleProfileId = style._id;
    await user.save();

    res.json({ message: 'Style profile activated', activeStyleProfileId: style._id });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid style id' });
    }
    res.status(500).json({ message: error.message });
  }
};
