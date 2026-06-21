const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar:   { type: String, default: '' },

  // Streak tracking
  currentStreak:   { type: Number, default: 0 },
  longestStreak:   { type: Number, default: 0 },
  lastAttemptDate: { type: Date },

  // Aggregate stats (updated on each attempt)
  totalAttempts:   { type: Number, default: 0 },
  totalScore:      { type: Number, default: 0 },
  totalQuestions:  { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate JWT
UserSchema.methods.getSignedJwt = function() {
  return require('jsonwebtoken').sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model('User', UserSchema);
