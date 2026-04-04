import AnswerStyle from '../../../../models/AnswerStyle.js';
import User from '../../../../models/User.js';

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

export const getUserStyles = async (req, res) => {
  try {
    const styles = await AnswerStyle.find({ userId: req.userId });
    res.json(styles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDefaultStyles = async (_req, res) => {
  res.json(DEFAULT_STYLES);
};

export const createStyle = async (req, res) => {
  try {
    const style = new AnswerStyle({
      ...req.body,
      userId: req.userId
    });
    await style.save();
    res.status(201).json(style);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStyle = async (req, res) => {
  try {
    const style = await AnswerStyle.findOne({ _id: req.params.id, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }
    Object.assign(style, req.body);
    await style.save();
    res.json(style);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStyle = async (req, res) => {
  try {
    const style = await AnswerStyle.findOne({ _id: req.params.id, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }
    await AnswerStyle.deleteOne({ _id: req.params.id });
    res.json({ message: 'Style profile deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateStyle = async (req, res) => {
  try {
    const style = await AnswerStyle.findOne({ _id: req.params.id, userId: req.userId });
    if (!style) {
      return res.status(404).json({ message: 'Style profile not found' });
    }
    await User.findByIdAndUpdate(req.userId, {
      activeStyleProfileId: req.params.id
    });
    res.json({ message: 'Style profile activated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

