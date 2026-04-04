import ExamPlan from '../models/ExamPlan.model.js';
import GeneratedContent from '../models/GeneratedContent.model.js';
import Context from '../models/Context.model.js';
import User from '../models/User.model.js';
import AnswerStyle from '../models/AnswerStyle.model.js';
import Subject from '../models/Subject.model.js';
import * as aiOrchestrator from '../services/aiOrchestrator.js';

const buildContextData = (contexts) => ({
  syllabus: contexts.find((c) => c.type === 'syllabus')?.content || '',
  notes: contexts
    .filter((c) => c.type === 'notes')
    .map((c) => c.content)
    .join('\n\n'),
  pyq: contexts.find((c) => c.type === 'pyq')?.content || ''
});

const buildUserContext = (user, subject) => ({
  university: user.university,
  branch: user.branch,
  semester: user.semester,
  subject: subject.name
});

const getOrCreateStyleProfile = async (userId) => {
  const user = await User.findById(userId);
  let styleProfile = null;
  
  if (user.activeStyleProfileId) {
    styleProfile = await AnswerStyle.findById(user.activeStyleProfileId);
  }
  
  if (!styleProfile) {
    const userStyles = await AnswerStyle.find({ userId });
    if (userStyles.length > 0) {
      styleProfile = userStyles[0];
      user.activeStyleProfileId = styleProfile._id;
      await user.save();
    } else {
      styleProfile = new AnswerStyle({
        userId,
        name: 'Default Style',
        sections: ['Definition', 'Explanation', 'Key Points', 'Conclusion'],
        tone: 'formal_exam',
        maxWordCount: 500,
        approximateLength: 'medium',
        isDefault: true
      });
      await styleProfile.save();
      user.activeStyleProfileId = styleProfile._id;
      await user.save();
    }
  }
  
  return styleProfile;
};

export const generateExamBlueprint = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const user = await User.findById(req.userId);
    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const blueprint = await aiOrchestrator.generateExamBlueprint(
      buildUserContext(user, subject),
      contextData
    );

    let examPlan = await ExamPlan.findOne({ userId: req.userId, subjectId });
    if (examPlan) {
      examPlan.blueprint = blueprint;
      await examPlan.save();
    } else {
      examPlan = new ExamPlan({
        userId: req.userId,
        subjectId,
        examDate: new Date(),
        blueprint
      });
      await examPlan.save();
    }

    res.json(examPlan);
  } catch (error) {
    if (error.message.includes('API key') || error.message.includes('authentication failed')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please check your OPENROUTER_API_KEY in the .env file.' 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const generateRevisionPlanner = async (req, res) => {
  try {
    const { subjectId, examDate, hoursPerDay } = req.body;
    const user = await User.findById(req.userId);
    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    let examPlan = await ExamPlan.findOne({ userId: req.userId, subjectId });
    if (!examPlan || !examPlan.blueprint) {
      return res.status(400).json({ message: 'Please generate exam blueprint first' });
    }

    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const revisionPlan = await aiOrchestrator.generateRevisionPlanner(
      buildUserContext(user, subject),
      contextData,
      examDate,
      hoursPerDay || 3,
      examPlan.blueprint
    );

    examPlan.examDate = new Date(examDate);
    examPlan.revisionPlan = revisionPlan;
    await examPlan.save();

    res.json(examPlan);
  } catch (error) {
    if (error.message.includes('API key') || error.message.includes('authentication failed')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please check your OPENROUTER_API_KEY in the .env file.' 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const generateRapidRevisionSheets = async (req, res) => {
  try {
    const { subjectId, topics } = req.body;
    const user = await User.findById(req.userId);
    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const styleProfile = await getOrCreateStyleProfile(req.userId);

    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const generatedContent = await aiOrchestrator.generateRapidRevisionSheets(
      buildUserContext(user, subject),
      styleProfile,
      contextData,
      topics || []
    );

    const content = new GeneratedContent({
      userId: req.userId,
      subjectId,
      type: 'revision_sheet',
      title: `Rapid Revision Sheet: ${
        Array.isArray(topics) ? topics.join(', ') : topics || 'All Topics'
      }`,
      topic: Array.isArray(topics) ? topics.join(', ') : topics || 'All Topics',
      content: generatedContent,
      styleProfileId: styleProfile._id,
      contextUsed: contexts.map((c) => c._id),
      metadata: {
        generatedAt: new Date()
      }
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateMockPaper = async (req, res) => {
  try {
    const { subjectId, shortCount, longCount } = req.body;
    const user = await User.findById(req.userId);
    const subject = await Subject.findOne({ _id: subjectId, userId: req.userId });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const styleProfile = await getOrCreateStyleProfile(req.userId);

    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const generatedContent = await aiOrchestrator.generateMockPaper(
      buildUserContext(user, subject),
      styleProfile,
      contextData,
      shortCount || 5,
      longCount || 3
    );

    const content = new GeneratedContent({
      userId: req.userId,
      subjectId,
      type: 'mock_paper',
      title: `Mock Paper: ${subject.name}`,
      topic: 'Mock Exam',
      content: generatedContent,
      styleProfileId: styleProfile._id,
      contextUsed: contexts.map((c) => c._id),
      metadata: {
        generatedAt: new Date()
      }
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamPlans = async (req, res) => {
  try {
    const examPlan = await ExamPlan.findOne({
      userId: req.userId,
      subjectId: req.params.subjectId
    });
    res.json(examPlan || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

