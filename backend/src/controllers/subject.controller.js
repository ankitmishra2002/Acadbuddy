import Subject from '../../../../models/Subject.model.js';
import User from '../../../../models/User.model.js';

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    const subject = new Subject({
      name,
      code,
      userId: req.userId
    });

    await subject.save();
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { subjects: subject._id }
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    Object.assign(subject, req.body);
    await subject.save();
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.deleteOne({ _id: req.params.id });
    await User.findByIdAndUpdate(req.userId, {
      $pull: { subjects: req.params.id }
    });

    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

