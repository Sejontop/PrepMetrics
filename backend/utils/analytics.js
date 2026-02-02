const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
router.get('/dashboard', protect, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Calculate Overall Stats
        const overallStats = await Quiz.aggregate([
            { $match: { user: userId, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalQuizzes: { $sum: 1 },
                    totalCorrect: { $sum: "$results.correctAnswers" },
                    totalQuestions: { $sum: "$results.totalQuestions" }
                }
            }
        ]);

        const stats = overallStats[0] || { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0 };
        const accuracy = stats.totalQuestions > 0 
            ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
            : 0;

        // 2. Calculate Subject Performance
        const subjectPerformance = await Quiz.aggregate([
            { $match: { user: userId, status: 'completed' } },
            {
                $group: {
                    _id: "$subject",
                    avgAccuracy: { $avg: "$results.accuracy" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    subject: "$subjectInfo.name",
                    accuracy: { $round: ["$avgAccuracy", 0] },
                    count: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overallStats: {
                    totalQuizzes: stats.totalQuizzes,
                    overallAccuracy: accuracy,
                    totalQuestions: stats.totalQuestions,
                    currentStreak: 0
                },
                subjectPerformance: subjectPerformance,
                weeklyActivity: []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;