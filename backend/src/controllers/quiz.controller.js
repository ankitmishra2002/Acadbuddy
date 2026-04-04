import Quiz from '../../../../models/Quiz.model.js';
import QuizAttempt from '../../../../models/QuizAttempt.model.js';

export const getQuizzes = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const query = { userId: req.userId, subjectId: req.params.subjectId };
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      userId: req.userId
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, userAnswer, timeTaken } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const isCorrect =
      quiz.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();

    const attempt = new QuizAttempt({
      userId: req.userId,
      quizId,
      subjectId: quiz.subjectId,
      topic: quiz.topic,
      isCorrect,
      timeTaken,
      userAnswer
    });

    await attempt.save();
    res.status(201).json({ attempt, isCorrect, correctAnswer: quiz.correctAnswer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizAnalytics = async (req, res) => {
  try {
    const { topic } = req.query;
    const query = { userId: req.userId, subjectId: req.params.subjectId };
    if (topic) query.topic = topic;

    const attempts = await QuizAttempt.find(query);
    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    const topicStats = {};
    attempts.forEach((attempt) => {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { total: 0, correct: 0 };
      }
      topicStats[attempt.topic].total++;
      if (attempt.isCorrect) topicStats[attempt.topic].correct++;
    });

    const topicBreakdown = Object.keys(topicStats).map((topicKey) => ({
      topic: topicKey,
      total: topicStats[topicKey].total,
      correct: topicStats[topicKey].correct,
      accuracy: (topicStats[topicKey].correct / topicStats[topicKey].total) * 100
    }));

    res.json({
      total,
      correct,
      accuracy: Math.round(accuracy * 100) / 100,
      topicBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

