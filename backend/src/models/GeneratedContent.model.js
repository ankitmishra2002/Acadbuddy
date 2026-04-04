import mongoose from 'mongoose';

const generatedContentSchema = new mongoose.Schema({
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
    enum: ['notes', 'report', 'ppt', 'revision_sheet', 'mock_paper'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  styleProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnswerStyle'
  },
  contextUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Context'
  }],
  metadata: {
    depth: String,
    wordCount: Number,
    slideCount: Number,
    generatedAt: Date
  },
  attachedFiles: [{
    url: String,
    publicId: String,
    fileName: String,
    fileType: String
  }]
}, {
  timestamps: true
});

generatedContentSchema.index({ userId: 1, subjectId: 1, type: 1 });

export default mongoose.model('GeneratedContent', generatedContentSchema);

