import GeneratedContent from '../../../../models/GeneratedContent.model.js';
import Context from '../../../../models/Context.model.js';
import User from '../../../../models/User.model.js';
import AnswerStyle from '../../../../models/AnswerStyle.model.js';
import Subject from '../../../../models/Subject.model.js';
import * as aiOrchestrator from '../services/aiOrchestrator.js';

const buildContextData = (contexts) => ({
  syllabus: contexts.find((c) => c.type === 'syllabus')?.content || '',
  notes: contexts
    .filter((c) => c.type === 'notes')
    .map((c) => c.content)
    .join('\n\n'),
  pyq: contexts.find((c) => c.type === 'pyq')?.content || ''
});

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const handleControllerError = (res, error) => {
  res.status(error.statusCode || 500).json({ message: error.message });
};

const getUserSubjectAndStyle = async (userId, subjectId) => {
  const user = await User.findById(userId);
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    throw createError('Subject not found', 404);
  }
  
  let styleProfile = null;
  
  // Check if user has an active style profile
  if (user.activeStyleProfileId) {
    styleProfile = await AnswerStyle.findById(user.activeStyleProfileId);
  }
  
  // If no active style profile, check if user has any style profiles
  if (!styleProfile) {
    const userStyles = await AnswerStyle.find({ userId });
    if (userStyles.length > 0) {
      // Activate the first available style profile
      styleProfile = userStyles[0];
      user.activeStyleProfileId = styleProfile._id;
      await user.save();
    } else {
      // Create a default style profile for the user
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
  
  return { user, subject, styleProfile };
};

export const getContentsBySubject = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.userId, subjectId: req.params.subjectId };
    if (type) query.type = type;

    const contents = await GeneratedContent.find(query)
      .sort({ createdAt: -1 })
      .populate('subjectId', 'name code');
    res.json(contents);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getContentById = async (req, res) => {
  try {
    const content = await GeneratedContent.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const generateNotesContent = async (req, res) => {
  try {
    const { subjectId, topic, depth, attachedFiles, customPrompt } = req.body;
    const { user, subject, styleProfile } = await getUserSubjectAndStyle(
      req.userId,
      subjectId
    );
    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const userContext = {
      university: user.university,
      branch: user.branch,
      semester: user.semester,
      subject: subject.name
    };

    const generatedContent = await aiOrchestrator.generateNotes(
      userContext,
      styleProfile,
      contextData,
      topic,
      depth || 'medium',
      customPrompt || ''
    );

    const content = new GeneratedContent({
      userId: req.userId,
      subjectId,
      type: 'notes',
      title: `Study Notes: ${topic}`,
      topic,
      content: generatedContent,
      styleProfileId: styleProfile._id,
      contextUsed: contexts.map((c) => c._id),
      attachedFiles: attachedFiles || [],
      metadata: {
        depth: depth || 'medium',
        generatedAt: new Date()
      }
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    // Provide more helpful error messages
    const errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
      return res.status(500).json({ 
        message: 'AI service is not configured. Please set OPENROUTER_API_KEY in your backend/.env file. See SETUP_AI.md for instructions.' 
      });
    }
    if (errorMessage.includes('authentication failed') || errorMessage.includes('401')) {
      return res.status(500).json({ 
        message: 'AI service authentication failed. Please check your OpenRouter API key in the backend/.env file. The key may be invalid or expired.' 
      });
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('Daily rate limit')) {
      return res.status(429).json({ 
        message: errorMessage.includes('Daily rate limit') || errorMessage.includes('free-models-per-day') 
          ? errorMessage 
          : 'AI service rate limit exceeded. Please try again in a few minutes or add credits to your OpenRouter account at https://openrouter.ai/' 
      });
    }
    if (errorMessage.includes('credits') || errorMessage.includes('402')) {
      return res.status(402).json({ 
        message: 'Insufficient credits in your OpenRouter account. Please add credits at https://openrouter.ai/' 
      });
    }
    
    // Log the full error for debugging
    console.error('Content generation error:', errorMessage);
    handleControllerError(res, error);
  }
};

export const generateReportContent = async (req, res) => {
  try {
    const { subjectId, topic, wordCount, requiredSections, attachedFiles, customPrompt } = req.body;
    const { user, subject, styleProfile } = await getUserSubjectAndStyle(
      req.userId,
      subjectId
    );
    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const userContext = {
      university: user.university,
      branch: user.branch,
      semester: user.semester,
      subject: subject.name
    };

    const generatedContent = await aiOrchestrator.generateReport(
      userContext,
      styleProfile,
      contextData,
      topic,
      wordCount || 1000,
      requiredSections || [
        'Abstract',
        'Introduction',
        'Methodology',
        'Analysis',
        'Conclusion',
        'References'
      ],
      customPrompt || ''
    );

    const content = new GeneratedContent({
      userId: req.userId,
      subjectId,
      type: 'report',
      title: `Report: ${topic}`,
      topic,
      content: generatedContent,
      styleProfileId: styleProfile._id,
      contextUsed: contexts.map((c) => c._id),
      attachedFiles: attachedFiles || [],
      metadata: {
        wordCount: wordCount || 1000,
        generatedAt: new Date()
      }
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    // Provide more helpful error messages
    const errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
      return res.status(500).json({ 
        message: 'AI service is not configured. Please set OPENROUTER_API_KEY in your backend/.env file. See SETUP_AI.md for instructions.' 
      });
    }
    if (errorMessage.includes('authentication failed') || errorMessage.includes('401')) {
      return res.status(500).json({ 
        message: 'AI service authentication failed. Please check your OpenRouter API key in the backend/.env file. The key may be invalid or expired.' 
      });
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('Daily rate limit')) {
      return res.status(429).json({ 
        message: errorMessage.includes('Daily rate limit') || errorMessage.includes('free-models-per-day') 
          ? errorMessage 
          : 'AI service rate limit exceeded. Please try again in a few minutes or add credits to your OpenRouter account at https://openrouter.ai/' 
      });
    }
    if (errorMessage.includes('credits') || errorMessage.includes('402')) {
      return res.status(402).json({ 
        message: 'Insufficient credits in your OpenRouter account. Please add credits at https://openrouter.ai/' 
      });
    }
    
    // Log the full error for debugging
    console.error('Content generation error:', errorMessage);
    handleControllerError(res, error);
  }
};

export const generatePPTContent = async (req, res) => {
  try {
    const { subjectId, topic, slideCount, presentationType, attachedFiles, customPrompt } = req.body;
    const { user, subject, styleProfile } = await getUserSubjectAndStyle(
      req.userId,
      subjectId
    );
    const contexts = await Context.find({ userId: req.userId, subjectId });
    const contextData = buildContextData(contexts);

    const userContext = {
      university: user.university,
      branch: user.branch,
      semester: user.semester,
      subject: subject.name
    };

    const generatedContent = await aiOrchestrator.generatePPT(
      userContext,
      styleProfile,
      contextData,
      topic,
      slideCount || 10,
      presentationType || 'seminar',
      customPrompt || ''
    );

    const content = new GeneratedContent({
      userId: req.userId,
      subjectId,
      type: 'ppt',
      title: `PPT: ${topic}`,
      topic,
      content: generatedContent,
      styleProfileId: styleProfile._id,
      contextUsed: contexts.map((c) => c._id),
      attachedFiles: attachedFiles || [],
      metadata: {
        slideCount: slideCount || 10,
        generatedAt: new Date()
      }
    });

    await content.save();
    res.status(201).json(content);
  } catch (error) {
    // Provide more helpful error messages
    const errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
      return res.status(500).json({ 
        message: 'AI service is not configured. Please set OPENROUTER_API_KEY in your backend/.env file. See SETUP_AI.md for instructions.' 
      });
    }
    if (errorMessage.includes('authentication failed') || errorMessage.includes('401')) {
      return res.status(500).json({ 
        message: 'AI service authentication failed. Please check your OpenRouter API key in the backend/.env file. The key may be invalid or expired.' 
      });
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('Daily rate limit')) {
      return res.status(429).json({ 
        message: errorMessage.includes('Daily rate limit') || errorMessage.includes('free-models-per-day') 
          ? errorMessage 
          : 'AI service rate limit exceeded. Please try again in a few minutes or add credits to your OpenRouter account at https://openrouter.ai/' 
      });
    }
    if (errorMessage.includes('credits') || errorMessage.includes('402')) {
      return res.status(402).json({ 
        message: 'Insufficient credits in your OpenRouter account. Please add credits at https://openrouter.ai/' 
      });
    }
    
    // Log the full error for debugging
    console.error('Content generation error:', errorMessage);
    handleControllerError(res, error);
  }
};

export const updateContent = async (req, res) => {
  try {
    const content = await GeneratedContent.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    Object.assign(content, req.body);
    await content.save();
    res.json(content);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteContent = async (req, res) => {
  try {
    const content = await GeneratedContent.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    await GeneratedContent.deleteOne({ _id: req.params.id });
    res.json({ message: 'Content deleted' });
  } catch (error) {
    handleControllerError(res, error);
  }
};

