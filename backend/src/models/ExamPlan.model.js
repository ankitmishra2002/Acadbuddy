import mongoose from 'mongoose';

const examPlanSchema = new mongoose.Schema({
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
  examDate: {
    type: Date,
    required: true
  },
  blueprint: {
    units: [{
      name: String,
      weightage: Number,
      difficulty: String,
      frequency: Number,
      importantTopics: [String]
    }]
  },
  revisionPlan: {
    days: [{
      date: Date,
      topics: [String],
      tasks: [String],
      hours: Number
    }],
    bufferDays: Number,
    mockTestDays: [Date]
  }
}, {
  timestamps: true
});

examPlanSchema.index({ userId: 1, subjectId: 1 });

export default mongoose.model('ExamPlan', examPlanSchema);

