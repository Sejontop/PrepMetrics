// models/Topic.js
const mongoose = require('mongoose');
const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  isActive: { type: Boolean, default: true },
  questionCount: { type: Number, default: 0 }
}, { timestamps: true });

topicSchema.index({ subject: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
