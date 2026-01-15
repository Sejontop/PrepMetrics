// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  profile: {
    avatar: String,
    bio: String,
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: Date,
    totalQuizzesTaken: { type: Number, default: 0 },
    totalQuestionsAttempted: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 }
  },

  subjectProgress: [{
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    quizzesCompleted: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in seconds
    lastAttemptDate: Date,
    interviewReadinessScore: { type: Number, default: 0 }, // 0-100
    strengthTopics: [String],
    weakTopics: [String],
    certificateEarned: { type: Boolean, default: false },
    certificateDate: Date
  }],

  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    defaultDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak logic
userSchema.methods.updateStreak = function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastActivity = this.profile.lastActivityDate 
    ? new Date(this.profile.lastActivityDate).setHours(0, 0, 0, 0) 
    : null;

  if (!lastActivity) {
    this.profile.currentStreak = 1;
  } else {
    const dayDiff = (today - lastActivity) / (1000 * 60 * 60 * 24);
    if (dayDiff === 1) {
      this.profile.currentStreak += 1;
    } else if (dayDiff > 1) {
      this.profile.currentStreak = 1;
    }
  }

  if (this.profile.currentStreak > this.profile.longestStreak) {
    this.profile.longestStreak = this.profile.currentStreak;
  }
  
  this.profile.lastActivityDate = new Date();
};

module.exports = mongoose.model('User', userSchema);