import mongoose from 'mongoose';

const contextSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['syllabus', 'pyq', 'notes', 'reference'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileUrl: String,
  metadata: {
    uploadDate: Date,
    topic: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for efficient searching
contextSchema.index({ userId: 1, subjectId: 1, type: 1 });
contextSchema.index({ content: 'text', title: 'text' });

export default mongoose.model('Context', contextSchema);

