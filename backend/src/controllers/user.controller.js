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

export const getUserProgress = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const quizQuery = { userId: req.userId };
    if (subjectId) quizQuery.subjectId = subjectId;

    const attempts = await QuizAttempt.find(quizQuery);
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

    const sessions = await Session.find({ userId: req.userId }).sort({ startTime: -1 });
    const studyDays = new Set();
    sessions.forEach((session) => {
      const date = new Date(session.startTime).toISOString().split('T')[0];
      studyDays.add(date);
    });

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedDates = Array.from(studyDays).sort().reverse();

    if (
      sortedDates.includes(today) ||
      sortedDates.includes(new Date(Date.now() - 86400000).toISOString().split('T')[0])
    ) {
      let currentDate = new Date();
      for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (sortedDates.includes(dateStr)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const totalStudyTime = sessions.reduce(
      (total, session) => total + (session.duration || 0),
      0
    );

    res.json({
      quiz: {
        totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        topicAccuracy
      },
      studyStreak: streak,
      totalStudyTime: Math.round((totalStudyTime / 3600000) * 100) / 100,
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

