import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password should be at least 6 characters long"],
    maxlength: [32, "Password should not exceed 32 characters"],
  },
  name: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  college: {
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
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  activeStyleProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnswerStyle'
  },
  examDates: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    examDate: Date,
    examType: String // 'midterm', 'final', 'internal'
  }],
  timeAvailability: {
    hoursPerDay: Number,
    preferredStudyTimes: [String]
  },
  refreshToken: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);