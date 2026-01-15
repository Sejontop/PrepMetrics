// models/Question.js
const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['mcq', 'aptitude', 'conceptual'],
    default: 'mcq'
  },
  
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  
  correctAnswer: { type: String, required: true }, // Can be index or text
  explanation: String,
  
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  
  marks: { type: Number, default: 1 },
  timeLimit: { type: Number, default: 60 }, // seconds
  
  tags: [String],
  
  // Analytics
  stats: {
    totalAttempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 0 } // User-perceived difficulty
  },
  
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ topic: 1 });

module.exports = mongoose.model('Question', questionSchema);