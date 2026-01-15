// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile with progress
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('subjectProgress.subject', 'name slug category icon')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics summary
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Calculate overall stats
    const totalQuizzes = await Quiz.countDocuments({ 
      user: req.user.id, 
      status: 'completed' 
    });

    const recentQuizzes = await Quiz.find({ 
      user: req.user.id, 
      status: 'completed' 
    })
      .sort({ completedAt: -1 })
      .limit(10);

    const avgAccuracy = recentQuizzes.length > 0
      ? recentQuizzes.reduce((sum, q) => sum + q.results.accuracy, 0) / recentQuizzes.length
      : 0;

    const totalTimeSpent = recentQuizzes.reduce(
      (sum, q) => sum + (q.results.totalTimeSpent || 0), 
      0
    );

    const stats = {
      totalQuizzes,
      currentStreak: user.profile.currentStreak,
      longestStreak: user.profile.longestStreak,
      averageAccuracy: Math.round(avgAccuracy * 100) / 100,
      totalTimeSpent: Math.floor(totalTimeSpent / 60), // in minutes
      totalQuestionsAttempted: user.profile.totalQuestionsAttempted,
      totalCorrectAnswers: user.profile.totalCorrectAnswers,
      subjectsStarted: user.subjectProgress.length,
      certificatesEarned: user.subjectProgress.filter(sp => sp.certificateEarned).length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/recent-activity
// @desc    Get user's recent quiz activity
// @access  Private
router.get('/recent-activity', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await Quiz.find({ 
      user: req.user.id, 
      status: 'completed' 
    })
      .populate('subject', 'name slug icon')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .select('subject results completedAt quizConfig');

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      subject: activity.subject.name,
      subjectSlug: activity.subject.slug,
      icon: activity.subject.icon,
      score: `${activity.results.marksObtained}/${activity.results.totalMarks}`,
      accuracy: activity.results.accuracy,
      difficulty: activity.quizConfig.difficulty,
      date: activity.completedAt,
      timeAgo: getTimeAgo(activity.completedAt)
    }));

    res.json({ success: true, data: formattedActivities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/subject-progress/:subjectId
// @desc    Get detailed progress for a specific subject
// @access  Private
router.get('/subject-progress/:subjectId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const subjectProgress = user.subjectProgress.find(
      sp => sp.subject.toString() === req.params.subjectId
    );

    if (!subjectProgress) {
      return res.json({ 
        success: true, 
        data: null,
        message: 'No progress found for this subject' 
      });
    }

    await user.populate({
      path: 'subjectProgress.subject',
      match: { _id: req.params.subjectId },
      select: 'name slug category icon'
    });

    res.json({ success: true, data: subjectProgress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, defaultDifficulty } = req.body;
    
    const updateData = {};
    if (theme) updateData['preferences.theme'] = theme;
    if (defaultDifficulty) updateData['preferences.defaultDifficulty'] = defaultDifficulty;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + ' year' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + ' month' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + ' day' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + ' hour' + (interval > 1 ? 's' : '') + ' ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + ' minute' + (interval > 1 ? 's' : '') + ' ago';
  
  return 'just now';
}

module.exports = router;




