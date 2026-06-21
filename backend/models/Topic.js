const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  subject:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Topic', TopicSchema);
