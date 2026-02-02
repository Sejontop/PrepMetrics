// backend/models/Quiz.js
const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  
  quizConfig: {
    mode: { type: String, enum: ['timed', 'non-timed'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], required: true },
    questionCount: { type: Number, required: true },
    timeLimit: Number, // total time in seconds for timed mode
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }]
  },
  
  questions: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    userAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // seconds
    marksAwarded: Number,
    skipped: { type: Boolean, default: false }
  }],
  
  results: {
    totalQuestions: Number,
    attemptedQuestions: Number,
    correctAnswers: Number,
    incorrectAnswers: Number,
    skippedQuestions: Number,
    totalMarks: Number,
    marksObtained: Number,
    accuracy: Number, // percentage
    totalTimeSpent: Number, // seconds
    averageTimePerQuestion: Number
  },
  
  performance: {
    topicWiseScore: [{
      topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
      total: Number,
      correct: Number,
      accuracy: Number
    }],
    difficultyWiseScore: {
      easy: { total: Number, correct: Number, accuracy: Number },
      medium: { total: Number, correct: Number, accuracy: Number },
      hard: { total: Number, correct: Number, accuracy: Number }
    },
    speedAnalysis: {
      fastCorrect: Number, // answers < avg time and correct
      slowCorrect: Number,
      fastIncorrect: Number,
      slowIncorrect: Number
    }
  },
  
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}, { timestamps: true });

quizSchema.index({ user: 1, subject: 1, createdAt: -1 });
quizSchema.index({ status: 1 });

module.exports = mongoose.model('Quiz', quizSchema);

