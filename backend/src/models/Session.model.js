import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  mode: {
    type: String,
    enum: ['notes', 'quiz', 'exam', 'revision'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number,
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedContent'
  }
}, {
  timestamps: true
});

sessionSchema.index({ userId: 1, startTime: -1 });

export default mongoose.model('Session', sessionSchema);

