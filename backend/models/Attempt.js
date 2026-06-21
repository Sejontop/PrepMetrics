const mongoose = require('mongoose');

/**
 * Stores the full granular data for one quiz attempt.
 * This is the backbone of all analytics.
 */
const QuestionResponseSchema = new mongoose.Schema({
  question:      { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption:{ type: Number },           // Index of chosen option
  isCorrect:     { type: Boolean, required: true },
  timeTakenSec:  { type: Number, default: 0 },
  difficulty:    { type: String },
  topic:         { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
}, { _id: false });

const AttemptSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  subject:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

  responses:    [QuestionResponseSchema],

  // Summary fields (computed on submission)
  totalQuestions: { type: Number },
  correctAnswers: { type: Number, default: 0 },
  score:          { type: Number, default: 0 },         // Percentage
  timeTakenSec:   { type: Number, default: 0 },
  passed:         { type: Boolean, default: false },

  // Readiness score for the subject (0–100)
  readinessScore: { type: Number, default: 0 },

  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast analytics queries
AttemptSchema.index({ user: 1, subject: 1, completedAt: -1 });
AttemptSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('Attempt', AttemptSchema);
