import User from '../models/User.model.js';
import QuizAttempt from '../models/QuizAttempt.model.js';
import Session from '../models/Session.model.js';
import GeneratedContent from '../models/GeneratedContent.model.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('subjects')
      .populate('activeStyleProfileId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Quiz timeTaken: seconds unless value is huge (then treat as ms) */
const attemptTimeToMs = (timeTaken) => {
  const t = Number(timeTaken);
  if (!Number.isFinite(t) || t <= 0) return 0;
  if (t > 100000) return t;
  return t * 1000;
};

export const getUserProgress = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const quizQuery = { userId: req.userId };
    if (subjectId) quizQuery.subjectId = subjectId;

    const attempts = await QuizAttempt.find(quizQuery).lean();
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const topicStats = {};
    attempts.forEach((attempt) => {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { total: 0, correct: 0 };
      }
      topicStats[attempt.topic].total++;
      if (attempt.isCorrect) topicStats[attempt.topic].correct++;
    });

    const topicAccuracy = Object.keys(topicStats).map((topic) => ({
      topic,
      accuracy: (topicStats[topic].correct / topicStats[topic].total) * 100,
      total: topicStats[topic].total
    }));

    const gcQuery = { userId: req.userId };
    if (subjectId) gcQuery.subjectId = subjectId;

    const generatedContents = await GeneratedContent.find(gcQuery).select('type content createdAt').lean();

    let generatedQuestionCount = 0;
    const contentDays = new Set();
    generatedContents.forEach((doc) => {
      contentDays.add(new Date(doc.createdAt).toISOString().split('T')[0]);
      const c = doc.content || {};
      if (doc.type === 'mock_paper' && Array.isArray(c.questions)) {
        generatedQuestionCount += c.questions.length;
      }
      if (Array.isArray(c.reviewQuestions)) {
        generatedQuestionCount += c.reviewQuestions.length;
      }
    });

    const practiceQuestions = totalQuestions + generatedQuestionCount;

    const sessions = await Session.find({ userId: req.userId }).sort({ startTime: -1 }).lean();

    const sessionDays = new Set();
    sessions.forEach((session) => {
      sessionDays.add(new Date(session.startTime).toISOString().split('T')[0]);
    });

    const quizDays = new Set();
    attempts.forEach((a) => {
      const ts = a.timestamp || a.createdAt;
      if (ts) quizDays.add(new Date(ts).toISOString().split('T')[0]);
    });

    const activeDays = new Set([...contentDays, ...sessionDays, ...quizDays]);

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (activeDays.has(today) || activeDays.has(yesterday)) {
      const currentDate = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (activeDays.has(dateStr)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let totalStudyMs = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    attempts.forEach((a) => {
      totalStudyMs += attemptTimeToMs(a.timeTaken);
    });

    const totalStudyTimeHours = Math.round((totalStudyMs / 3600000) * 100) / 100;

    res.json({
      quiz: {
        totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        topicAccuracy
      },
      practiceQuestions,
      generatedContentCount: generatedContents.length,
      studyStreak: streak,
      totalStudyTime: totalStudyTimeHours,
      totalSessions: sessions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentContent = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const contents = await GeneratedContent.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('subjectId', 'name code')
      .select('title type topic createdAt subjectId');
    
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

