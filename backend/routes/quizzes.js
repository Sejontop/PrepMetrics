// backend/routes/quizzes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ==========================================
// 1. DASHBOARD DATA (Calculates Real Data)
// ==========================================
router.get('/dashboard', protect, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Calculate Overall Stats
        const overallStatsArr = await Quiz.aggregate([
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

        const overall = overallStatsArr[0] || { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0 };
        const accuracy = overall.totalQuestions > 0 
            ? Math.round((overall.totalCorrect / overall.totalQuestions) * 100) 
            : 0;

        // Calculate Subject Performance (for Charts)
        const subjectPerformance = await Quiz.aggregate([
            { $match: { user: userId, status: 'completed' } },
            {
                $group: {
                    _id: "$subject",
                    accuracy: { $avg: "$results.accuracy" },
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "subjects", // Make sure your collection name is 'subjects'
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    subject: "$subjectInfo.name",
                    accuracy: { $round: ["$accuracy", 0] },
                    count: 1
                }
            }
        ]);

        const dashboardStats = {
            overallStats: {
                totalQuizzes: overall.totalQuizzes,
                overallAccuracy: accuracy,
                currentStreak: 0,
                totalQuestions: overall.totalQuestions
            },
            subjectPerformance: subjectPerformance,
            weeklyActivity: [] // Optional: Can add similar logic for dates
        };

        res.json({ success: true, data: dashboardStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. GENERATE QUIZ
// ==========================================
router.post('/generate', protect, async (req, res) => {
    try {
        const { subjectId, difficulty, questionCount } = req.body;
        const query = { subject: new mongoose.Types.ObjectId(subjectId) };
        if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;

        let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: parseInt(questionCount) || 5 } }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: 'No questions found' });
        }

        const quiz = await Quiz.create({
            user: req.user.id,
            subject: subjectId,
            quizConfig: { mode: 'non-timed', difficulty: difficulty || 'mixed', questionCount: questions.length },
            questions: questions.map(q => ({ question: q._id })),
            status: 'in-progress'
        });

        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// ==========================================
// 5. QUIZ HISTORY (FOR DASHBOARD)
// ==========================================
router.get('/history', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const quizzes = await Quiz.find({
            user: req.user.id,
            status: 'completed'
        })
            .populate('subject', 'name slug')
            .sort({ completedAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        console.error('QUIZ HISTORY ERROR:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// 3. GET QUIZ BY ID
// ==========================================
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id })
            .populate('subject', 'name') 
            .populate('questions.question');
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        res.json({ success: true, data: quiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 4. SUBMIT QUIZ (Calculation Fixed)
// ==========================================
router.put('/:id/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body; 
        const quiz = await Quiz.findById(req.params.id).populate('questions.question');
        
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        if (quiz.status === 'completed') return res.status(400).json({ success: false, message: 'Already submitted' });

        let correctCount = 0;
        let totalTime = 0;
        let skippedCount = 0;

        const updatedQuestions = quiz.questions.map((q) => {
            const userSub = answers.find(a => a.questionId.toString() === q.question._id.toString());
            const isCorrect = userSub ? userSub.userAnswer === q.question.correctAnswer : false;
            const isSkipped = !userSub || !userSub.userAnswer;

            if (isCorrect) correctCount++;
            if (isSkipped) skippedCount++;
            totalTime += (userSub?.timeSpent || 0);

            return {
                question: q.question._id,
                userAnswer: userSub ? userSub.userAnswer : null,
                isCorrect: isCorrect,
                timeSpent: userSub ? userSub.timeSpent : 0,
                skipped: isSkipped
            };
        });

        quiz.results = {
            totalQuestions: quiz.questions.length,
            attemptedQuestions: quiz.questions.length - skippedCount,
            correctAnswers: correctCount,
            incorrectAnswers: quiz.questions.length - correctCount - skippedCount,
            skippedQuestions: skippedCount,
            totalMarks: quiz.questions.length,
            marksObtained: correctCount,
            accuracy: Math.round((correctCount / quiz.questions.length) * 100) || 0,
            totalTimeSpent: totalTime,
            averageTimePerQuestion: Math.round(totalTime / quiz.questions.length) || 0
        };

        quiz.questions = updatedQuestions;
        quiz.status = 'completed';
        quiz.completedAt = new Date();

        await quiz.save();
        
        const finalQuiz = await Quiz.findById(quiz._id).populate('subject', 'name').populate('questions.question');
        res.json({ success: true, data: finalQuiz });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;