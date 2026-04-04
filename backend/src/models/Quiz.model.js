import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  question: {
    type: String,
    required: true
  },
  options: [String],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['mcq', 'short', 'long'],
    default: 'short'
  }
}, {
  timestamps: true
});

quizSchema.index({ userId: 1, subjectId: 1, topic: 1 });

export default mongoose.model('Quiz', quizSchema);

