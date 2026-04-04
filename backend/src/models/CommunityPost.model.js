import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedContent'
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
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    university: {
      type: String,
      required: true
    },
    branch: {
      type: String,
      required: true
    },
    semester: {
      type: Number,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    tags: [String]
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'reported', 'hidden'],
    default: 'active'
  },
  reportedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

communityPostSchema.index({ 'metadata.university': 1, 'metadata.branch': 1, 'metadata.subject': 1 });
communityPostSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('CommunityPost', communityPostSchema);

