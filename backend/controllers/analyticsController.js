const Attempt = require('../models/Attempt');
const User = require('../models/User');

/**
 * @desc  Full dashboard analytics for current user
 * @route GET /api/analytics/dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Score trend (last 20 attempts)
    const recentAttempts = await Attempt.find({ user: userId })
      .populate('subject', 'name color')
      .sort('-completedAt')
      .limit(20)
      .select('score subject completedAt timeTakenSec readinessScore passed');

    // Subject-wise aggregation
    const subjectStats = await Attempt.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $group: {
          _id: '$subject',
          avgScore:       { $avg: '$score' },
          totalAttempts:  { $sum: 1 },
          bestScore:      { $max: '$score' },
          lastAttempt:    { $max: '$completedAt' },
          avgReadiness:   { $avg: '$readinessScore' },
        }
      },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $project: {
          subjectName: '$subject.name',
          subjectColor: '$subject.color',
          subjectIcon: '$subject.icon',
          avgScore: { $round: ['$avgScore', 1] },
          bestScore: 1, totalAttempts: 1, lastAttempt: 1,
          avgReadiness: { $round: ['$avgReadiness', 1] },
        }
      },
    ]);

    // Difficulty distribution
    const difficultyStats = await Attempt.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $unwind: '$responses' },
      { $group: {
          _id: '$responses.difficulty',
          total:   { $sum: 1 },
          correct: { $sum: { $cond: ['$responses.isCorrect', 1, 0] } },
        }
      },
    ]);

    // Topic-wise weak areas
    const topicStats = await Attempt.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $unwind: '$responses' },
      { $group: {
          _id: '$responses.topic',
          total:   { $sum: 1 },
          correct: { $sum: { $cond: ['$responses.isCorrect', 1, 0] } },
        }
      },
      { $addFields: { accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] } } },
      { $sort: { accuracy: 1 } },
      { $limit: 10 },
      { $lookup: { from: 'topics', localField: '_id', foreignField: '_id', as: 'topic' } },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
    ]);

    const user = await User.findById(userId).select('currentStreak longestStreak totalAttempts');

    res.json({
      success: true,
      data: {
        scoreTrend:      recentAttempts.reverse(),
        subjectStats,
        difficultyStats,
        topicStats,
        streak:          { current: user.currentStreak, longest: user.longestStreak },
        totalAttempts:   user.totalAttempts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Platform-level analytics (admin)
 * @route GET /api/analytics/platform
 */
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalAttempts, subjectEngagement, avgScoreByDifficulty] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Attempt.countDocuments(),
      Attempt.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
        { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
        { $unwind: '$subject' },
        { $project: { name: '$subject.name', count: 1, avgScore: { $round: ['$avgScore', 1] } } },
        { $sort: { count: -1 } },
      ]),
      Attempt.aggregate([
        { $unwind: '$responses' },
        { $group: {
            _id: '$responses.difficulty',
            total:   { $sum: 1 },
            correct: { $sum: { $cond: ['$responses.isCorrect', 1, 0] } },
          }
        },
        { $addFields: { accuracy: { $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 1] } } },
      ]),
    ]);

    res.json({ success: true, data: { totalUsers, totalAttempts, subjectEngagement, avgScoreByDifficulty } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
