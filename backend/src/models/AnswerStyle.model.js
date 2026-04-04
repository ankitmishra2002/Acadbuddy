import mongoose from 'mongoose';

const answerStyleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  sections: [{
    type: String,
    required: true
  }],
  tone: {
    type: String,
    enum: ['formal_exam', 'conceptual', 'casual', 'academic'],
    required: true
  },
  maxWordCount: Number,
  approximateLength: {
    type: String,
    enum: ['short', 'medium', 'detailed']
  },
  instructions: String
}, {
  timestamps: true
});

export default mongoose.model('AnswerStyle', answerStyleSchema);

