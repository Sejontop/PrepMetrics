const mongoose = require('mongoose');
const Attempt = require('../models/Attempt');

/**
 * @desc  Global leaderboard based on average score
 * @route GET /api/leaderboard/global
 */
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const lb = await Attempt.aggregate([
      { $group: {
          _id:          '$user',
          avgScore:     { $avg: '$score' },
          totalAttempts:{ $sum: 1 },
          bestScore:    { $max: '$score' },
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
          name:          '$user.name',
          avgScore:      { $round: ['$avgScore', 1] },
          totalAttempts: 1,
          bestScore:     1,
        }
      },
    ]);
    res.json({ success: true, data: lb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Subject-wise leaderboard
 * @route GET /api/leaderboard/subject/:subjectId
 */
exports.getSubjectLeaderboard = async (req, res) => {
  try {
    const lb = await Attempt.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(req.params.subjectId) } },
      { $group: {
          _id:          '$user',
          avgScore:     { $avg: '$score' },
          totalAttempts:{ $sum: 1 },
          bestScore:    { $max: '$score' },
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', avgScore: { $round: ['$avgScore', 1] }, totalAttempts: 1, bestScore: 1 } },
    ]);
    res.json({ success: true, data: lb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
