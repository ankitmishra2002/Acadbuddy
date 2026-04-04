import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

communityCommentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model('CommunityComment', communityCommentSchema);

