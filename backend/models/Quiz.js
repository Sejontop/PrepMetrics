const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topic:       { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  isTimed:     { type: Boolean, default: true },
  timeLimitMin:{ type: Number, default: 15 },
  passingScore:{ type: Number, default: 60 },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
