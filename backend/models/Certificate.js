// models/Certificate.js
const mongoose = require('mongoose');
const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  
  certificateId: { type: String, required: true, unique: true },
  
  performanceData: {
    totalQuizzes: Number,
    averageAccuracy: Number,
    totalQuestionsAttempted: Number,
    overallScore: Number,
    topicsCovered: Number
  },
  
  issuedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  
  verification: {
    isVerified: { type: Boolean, default: true },
    verificationUrl: String
  }
}, { timestamps: true });

certificateSchema.index({ user: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);