// models/Subject.js
const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: {
    type: String,
    enum: [
      'Aptitude & Reasoning',
      'Computer Science Fundamentals',
      'Data Structures & Algorithms',
      'Programming Languages',
      'Cyber Security'
    ],
    required: true
  },
  icon: String,
  isActive: { type: Boolean, default: true },
  totalQuestions: { type: Number, default: 0 },
  
  // Certificate criteria
  certificateCriteria: {
    minimumQuizzes: { type: Number, default: 5 },
    minimumAccuracy: { type: Number, default: 70 }, // percentage
    requiredTopicsCovered: { type: Number, default: 3 }
  },

  stats: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);

