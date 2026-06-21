const Certificate = require('../models/Certificate');
const Attempt = require('../models/Attempt');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => require('crypto').randomUUID() } : { v4: () => Math.random().toString(36).slice(2) };

/**
 * @desc  Check eligibility and issue certificate
 * @route POST /api/certificates/check/:subjectId
 */
exports.checkAndIssue = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;

    // Already has cert?
    const existing = await Certificate.findOne({ user: userId, subject: subjectId }).populate('subject', 'name');
    if (existing) return res.json({ success: true, data: existing, alreadyIssued: true });

    // Check: ≥5 attempts, avg score ≥70
    const attempts = await Attempt.find({ user: userId, subject: subjectId });
    if (attempts.length < 5)
      return res.json({ success: false, eligible: false, message: `Need at least 5 attempts (you have ${attempts.length})` });

    const avgScore = attempts.reduce((s, a) => s + a.score, 0) / attempts.length;
    if (avgScore < 70)
      return res.json({ success: false, eligible: false, message: `Need avg score ≥70% (yours: ${avgScore.toFixed(1)}%)` });

    const cert = await Certificate.create({
      user:          userId,
      subject:       subjectId,
      score:         Math.round(avgScore),
      certificateId: `PM-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    });

    const populated = await cert.populate('subject', 'name');
    res.status(201).json({ success: true, data: populated, eligible: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Get all certificates of current user
 * @route GET /api/certificates/my
 */
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user.id }).populate('subject', 'name icon color');
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
