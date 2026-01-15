// routes/analytics.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive analytics dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user with populated subject progress
    const user = await User.findById(userId)
      .populate('subjectProgress.subject', 'name slug category icon');

    // Get all completed quizzes
    const allQuizzes = await Quiz.find({ user: userId, status: 'completed' })
      .populate('subject', 'name slug category')
      .sort({ completedAt: -1 });

    // Overall Statistics
    const overallStats = {
      totalQuizzes: user.profile.totalQuizzesTaken,
      totalQuestions: user.profile.totalQuestionsAttempted,
      correctAnswers: user.profile.totalCorrectAnswers,
      overallAccuracy: user.profile.totalQuestionsAttempted > 0
        ? ((user.profile.totalCorrectAnswers / user.profile.totalQuestionsAttempted) * 100).toFixed(2)
        : 0,
      currentStreak: user.profile.currentStreak,
      longestStreak: user.profile.longestStreak
    };

    // Performance Trend (last 10 quizzes)
    const recentQuizzes = allQuizzes.slice(0, 10).reverse();
    const performanceTrend = recentQuizzes.map(quiz => ({
      date: quiz.completedAt,
      accuracy: quiz.results.accuracy,
      score: quiz.results.marksObtained,
      subject: quiz.subject.name
    }));

    // Subject-wise Performance
    const subjectPerformance = user.subjectProgress.map(sp => ({
      subject: sp.subject.name,
      slug: sp.subject.slug,
      category: sp.subject.category,
      quizzesCompleted: sp.quizzesCompleted,
      averageAccuracy: sp.averageAccuracy,
      interviewReadiness: sp.interviewReadinessScore,
      strengthTopics: sp.strengthTopics.length,
      weakTopics: sp.weakTopics.length,
      certificateEarned: sp.certificateEarned
    }));

    // Time Analysis
    const totalTimeSpent = allQuizzes.reduce((sum, q) => sum + (q.results.totalTimeSpent || 0), 0);
    const avgTimePerQuiz = allQuizzes.length > 0 
      ? Math.round(totalTimeSpent / allQuizzes.length) 
      : 0;

    // Difficulty Distribution
    const difficultyStats = await Quiz.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $unwind: '$questions' },
      {
        $lookup: {
          from: 'questions',
          localField: 'questions.question',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      { $unwind: '$questionDetails' },
      {
        $group: {
          _id: '$questionDetails.difficulty',
          total: { $sum: 1 },
          correct: { 
            $sum: { $cond: ['$questions.isCorrect', 1, 0] }
          }
        }
      }
    ]);

    const difficultyPerformance = {
      easy: difficultyStats.find(d => d._id === 'easy') || { total: 0, correct: 0 },
      medium: difficultyStats.find(d => d._id === 'medium') || { total: 0, correct: 0 },
      hard: difficultyStats.find(d => d._id === 'hard') || { total: 0, correct: 0 }
    };

    // Weekly Activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyQuizzes = await Quiz.find({
      user: userId,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo }
    });

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayQuizzes = weeklyQuizzes.filter(q => {
        const qDate = new Date(q.completedAt);
        return qDate >= date && qDate < nextDate;
      });

      weeklyActivity.push({
        date: date.toISOString().split('T')[0],
        quizzes: dayQuizzes.length,
        questions: dayQuizzes.reduce((sum, q) => sum + q.results.attemptedQuestions, 0)
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
        difficultyPerformance,
        weeklyActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/subject/:subjectId
// @desc    Get detailed analytics for a specific subject
// @access  Private
router.get('/subject/:subjectId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.params;

    const user = await User.findById(userId);
    const subjectProgress = user.subjectProgress.find(
      sp => sp.subject.toString() === subjectId
    );

    if (!subjectProgress) {
      return res.status(404).json({ 
        success: false, 
        message: 'No progress found for this subject' 
      });
    }

    // Get all quizzes for this subject
    const quizzes = await Quiz.find({
      user: userId,
      subject: subjectId,
      status: 'completed'
    })
    .populate('performance.topicWiseScore.topic', 'name')
    .sort({ completedAt: -1 });

    // Aggregate topic-wise performance
    const topicPerformance = {};
    quizzes.forEach(quiz => {
      quiz.performance.topicWiseScore.forEach(ts => {
        const topicName = ts.topic.name;
        if (!topicPerformance[topicName]) {
          topicPerformance[topicName] = { total: 0, correct: 0 };
        }
        topicPerformance[topicName].total += ts.total;
        topicPerformance[topicName].correct += ts.correct;
      });
    });

    const topicAnalysis = Object.keys(topicPerformance).map(topic => ({
      topic,
      accuracy: ((topicPerformance[topic].correct / topicPerformance[topic].total) * 100).toFixed(2),
      questionsAttempted: topicPerformance[topic].total,
      status: topicPerformance[topic].correct / topicPerformance[topic].total >= 0.75 
        ? 'Strong' 
        : topicPerformance[topic].correct / topicPerformance[topic].total >= 0.5 
        ? 'Average' 
        : 'Needs Improvement'
    }));

    // Progress over time
    const progressTimeline = quizzes.reverse().map((quiz, index) => ({
      attempt: index + 1,
      date: quiz.completedAt,
      accuracy: quiz.results.accuracy,
      score: quiz.results.marksObtained,
      timeSpent: Math.round(quiz.results.totalTimeSpent / 60)
    }));

    // Speed analysis
    const speedData = quizzes.map(q => ({
      date: q.completedAt,
      avgTimePerQuestion: q.results.averageTimePerQuestion,
      accuracy: q.results.accuracy
    }));

    // Interview readiness breakdown
    const readinessBreakdown = {
      overall: subjectProgress.interviewReadinessScore,
      components: {
        consistency: Math.min((subjectProgress.quizzesCompleted / 10) * 100, 100),
        accuracy: subjectProgress.averageAccuracy,
        topicCoverage: (subjectProgress.strengthTopics.length / 5) * 100
      },
      recommendation: getReadinessRecommendation(subjectProgress.interviewReadinessScore)
    };

    res.json({
      success: true,
      data: {
        summary: {
          quizzesCompleted: subjectProgress.quizzesCompleted,
          averageAccuracy: subjectProgress.averageAccuracy,
          interviewReadiness: subjectProgress.interviewReadinessScore,
          timeSpent: Math.round(subjectProgress.timeSpent / 60),
          certificateEarned: subjectProgress.certificateEarned
        },
        topicAnalysis,
        progressTimeline,
        speedData,
        readinessBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function for readiness recommendations
function getReadinessRecommendation(score) {
  if (score >= 80) {
    return {
      level: 'Interview Ready',
      message: 'Excellent! You are well-prepared for interviews in this subject.',
      suggestions: ['Practice mock interviews', 'Focus on communication skills']
    };
  } else if (score >= 60) {
    return {
      level: 'Good Progress',
      message: 'You\'re making good progress. A bit more practice will make you interview-ready.',
      suggestions: ['Review weak topics', 'Take more practice quizzes', 'Focus on consistency']
    };
  } else if (score >= 40) {
    return {
      level: 'Moderate',
      message: 'You have a foundation but need more practice.',
      suggestions: ['Strengthen fundamentals', 'Practice regularly', 'Focus on weak areas']
    };
  } else {
    return {
      level: 'Needs Improvement',
      message: 'Keep practicing! Focus on building strong fundamentals.',
      suggestions: ['Start with easy difficulty', 'Study concepts thoroughly', 'Practice daily']
    };
  }
}

module.exports = router;

