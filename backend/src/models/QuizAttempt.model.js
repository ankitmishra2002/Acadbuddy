import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  },
  userAnswer: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

quizAttemptSchema.index({ userId: 1, subjectId: 1, topic: 1 });
quizAttemptSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);

