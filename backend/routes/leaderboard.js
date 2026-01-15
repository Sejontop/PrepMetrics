// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// @route   GET /api/leaderboard/global
// @desc    Get global leaderboard
// @access  Public
router.get('/global', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const leaderboard = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          'profile.avatar': 1,
          'profile.totalQuizzesTaken': 1,
          'profile.totalCorrectAnswers': 1,
          'profile.totalQuestionsAttempted': 1,
          'profile.currentStreak': 1,
          overallScore: {
            $cond: [
              { $gt: ['$profile.totalQuestionsAttempted', 0] },
              {
                $multiply: [
                  { $divide: ['$profile.totalCorrectAnswers', '$profile.totalQuestionsAttempted'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { overallScore: -1, 'profile.totalQuizzesTaken': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const total = await User.countDocuments();

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      name: user.name,
      avatar: user.profile?.avatar,
      quizzesTaken: user.profile?.totalQuizzesTaken || 0,
      accuracy: user.overallScore.toFixed(2),
      currentStreak: user.profile?.currentStreak || 0
    }));

    res.json({
      success: true,
      data: rankedLeaderboard,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/leaderboard/subject/:subjectId
// @desc    Get subject-specific leaderboard
// @access  Public
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const leaderboard = await User.aggregate([
      { $unwind: '$subjectProgress' },
      { $match: { 'subjectProgress.subject': mongoose.Types.ObjectId(subjectId) } },
      {
        $project: {
          name: 1,
          'profile.avatar': 1,
          quizzesCompleted: '$subjectProgress.quizzesCompleted',
          averageAccuracy: '$subjectProgress.averageAccuracy',
          interviewReadiness: '$subjectProgress.interviewReadinessScore',
          totalScore: '$subjectProgress.totalScore'
        }
      },
      { $sort: { totalScore: -1, averageAccuracy: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      name: user.name,
      avatar: user.profile?.avatar,
      quizzesCompleted: user.quizzesCompleted,
      accuracy: user.averageAccuracy.toFixed(2),
      interviewReadiness: user.interviewReadiness,
      totalScore: user.totalScore
    }));

    res.json({ success: true, data: rankedLeaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/leaderboard/my-rank
// @desc    Get current user's rank
// @access  Private
router.get('/my-rank', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Calculate user's position in global leaderboard
    const allUsers = await User.aggregate([
      {
        $project: {
          _id: 1,
          overallScore: {
            $cond: [
              { $gt: ['$profile.totalQuestionsAttempted', 0] },
              {
                $multiply: [
                  { $divide: ['$profile.totalCorrectAnswers', '$profile.totalQuestionsAttempted'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { overallScore: -1 } }
    ]);

    const rank = allUsers.findIndex(u => u._id.toString() === userId) + 1;

    res.json({
      success: true,
      data: {
        globalRank: rank,
        totalUsers: allUsers.length,
        percentile: ((1 - (rank / allUsers.length)) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;