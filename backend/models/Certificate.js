const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  issuedAt:    { type: Date, default: Date.now },
  score:       { type: Number },
  certificateId: { type: String, unique: true },
}, { timestamps: true });

CertificateSchema.index({ user: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
