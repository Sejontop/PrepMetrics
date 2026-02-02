//backend/routes/analytics.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch User Data with populates
    const user = await User.findById(userId)
      .populate('subjectProgress.subject', 'name slug category icon');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Get all completed quizzes
    const allQuizzes = await Quiz.find({ user: userId, status: 'completed' })
      .populate('subject', 'name slug category')
      .sort({ completedAt: -1 });

    // 3. Overall Statistics (Added Safeties)
    const profile = user.profile || {};
    const overallStats = {
      totalQuizzes: profile.totalQuizzesTaken || 0,
      totalQuestions: profile.totalQuestionsAttempted || 0,
      correctAnswers: profile.totalCorrectAnswers || 0,
      overallAccuracy: (profile.totalQuestionsAttempted > 0)
        ? ((profile.totalCorrectAnswers / profile.totalQuestionsAttempted) * 100).toFixed(2)
        : 0,
      currentStreak: profile.currentStreak || 0,
      longestStreak: profile.longestStreak || 0
    };

    // 4. Performance Trend (Last 10)
    const recentQuizzes = allQuizzes.slice(0, 10).reverse();
    const performanceTrend = recentQuizzes.map(quiz => ({
      date: quiz.completedAt,
      accuracy: quiz.results?.accuracy || 0,
      score: quiz.results?.marksObtained || 0,
      subject: quiz.subject?.name || 'Unknown'
    }));

    // 5. Subject Performance
    const subjectPerformance = (user.subjectProgress || []).map(sp => ({
      subject: sp.subject?.name || 'Unknown',
      slug: sp.subject?.slug || '',
      category: sp.subject?.category || '',
      quizzesCompleted: sp.quizzesCompleted || 0,
      averageAccuracy: sp.averageAccuracy || 0,
      interviewReadiness: sp.interviewReadinessScore || 0,
      strengthTopics: sp.strengthTopics?.length || 0,
      weakTopics: sp.weakTopics?.length || 0,
      certificateEarned: sp.certificateEarned || false
    }));

    // 6. Time Analysis
    const totalTimeSpent = allQuizzes.reduce((sum, q) => sum + (q.results?.totalTimeSpent || 0), 0);
    const avgTimePerQuiz = allQuizzes.length > 0 ? Math.round(totalTimeSpent / allQuizzes.length) : 0;

    // 7. Difficulty Distribution (Advanced Aggregation)
    const difficultyStats = await Quiz.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $unwind: '$questions' },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.question',
          foreignField: '_id',
          as: 'details'
        }
      },
      { $unwind: '$details' },
      {
        $group: {
          _id: '$details.difficulty',
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$questions.isCorrect', 1, 0] } }
        }
      }
    ]);

    const getDiffData = (level) => difficultyStats.find(d => d._id === level) || { total: 0, correct: 0 };

    // 8. Weekly Activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyQuizzes = allQuizzes.filter(q => new Date(q.completedAt) >= sevenDaysAgo);
    const weeklyActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayQuizzes = weeklyQuizzes.filter(q => q.completedAt.toISOString().split('T')[0] === dateStr);

      weeklyActivity.push({
        date: dateStr,
        quizzes: dayQuizzes.length,
        questions: dayQuizzes.reduce((sum, q) => sum + (q.results?.attemptedQuestions || 0), 0)
      });
    }

    res.json({
      success: true,
      data: {
        overallStats,
        performanceTrend,
        subjectPerformance,
        timeAnalysis: {
          totalMinutes: Math.round(totalTimeSpent / 60),
          averagePerQuiz: Math.round(avgTimePerQuiz / 60),
          totalQuizzes: allQuizzes.length
        },
        difficultyPerformance: {
          easy: getDiffData('easy'),
          medium: getDiffData('medium'),
          hard: getDiffData('hard')
        },
        weeklyActivity
      }
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function logic remains same...
module.exports = router;