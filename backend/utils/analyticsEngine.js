const User = require('../models/User');

/**
 * Compute interview readiness score (0–100) based on:
 * - Recent performance trend
 * - Consistency
 * - Current attempt score
 */
exports.computeReadiness = (prevAttempts, currentScore) => {
  const scoreVal = typeof currentScore === 'number' && !isNaN(currentScore) ? currentScore : 0;
  if (prevAttempts.length === 0) return Math.round(scoreVal * 0.7);

  const scores = [...prevAttempts.map(a => typeof a.score === 'number' && !isNaN(a.score) ? a.score : 0), scoreVal];
  const avg = scores.reduce((s, x) => s + x, 0) / scores.length;

  // Trend: is score improving?
  const trend = scores.length >= 2
    ? scores[scores.length - 1] - scores[0]
    : 0;

  // Consistency: low standard deviation → higher readiness
  const mean = avg;
  const variance = scores.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const consistencyBonus = Math.max(0, 20 - stdDev / 5);

  const readiness = Math.min(100, Math.round(avg * 0.7 + trend * 0.1 + consistencyBonus));
  return Math.max(0, readiness);
};

/**
 * Update user streak based on last attempt date
 */
exports.updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const now = new Date();
  const last = user.lastAttemptDate;

  if (!last) {
    user.currentStreak = 1;
  } else {
    // Zero out the time part of the dates to get the difference in calendar days
    const d1 = new Date(now);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(last);
    d2.setHours(0, 0, 0, 0);

    const diffTime = d1 - d2;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day – no change
    } else if (diffDays === 1) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1; // Streak broken
    }
  }

  if (user.currentStreak > user.longestStreak) user.longestStreak = user.currentStreak;
  user.lastAttemptDate = now;
  await user.save();
};

/**
 * Generate a readiness remark for display
 */
exports.getReadinessRemark = (score) => {
  if (score >= 85) return { label: 'Interview Ready', color: '#22c55e' };
  if (score >= 70) return { label: 'Almost Ready',    color: '#eab308' };
  if (score >= 50) return { label: 'Needs Practice',  color: '#f97316' };
  return { label: 'Beginner Level', color: '#ef4444' };
};
