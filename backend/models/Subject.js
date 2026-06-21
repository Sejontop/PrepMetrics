const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String },
  icon:        { type: String, default: '📚' },
  color:       { type: String, default: '#6366f1' },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
