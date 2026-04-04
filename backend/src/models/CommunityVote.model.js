import mongoose from 'mongoose';

const communityVoteSchema = new mongoose.Schema({
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
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  timestamps: true
});

communityVoteSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model('CommunityVote', communityVoteSchema);

