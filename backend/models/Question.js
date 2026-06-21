const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  type:        { type: String, enum: ['mcq', 'aptitude', 'conceptual'], default: 'mcq' },
  options:     [OptionSchema],
  explanation: { type: String },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  tags:        [String],
  timeLimitSec:{ type: Number, default: 60 },

  // Analytics metadata
  totalAttempts: { type: Number, default: 0 },
  totalCorrect:  { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual: difficulty score
QuestionSchema.virtual('accuracyRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  return ((this.totalCorrect / this.totalAttempts) * 100).toFixed(1);
});

module.exports = mongoose.model('Question', QuestionSchema);
