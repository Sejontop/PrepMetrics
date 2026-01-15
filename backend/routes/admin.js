// routes/admin.js
const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// ========== SUBJECT MANAGEMENT ==========

// @route   GET /api/admin/subjects
// @desc    Get all subjects with stats
// @access  Admin
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ category: 1, name: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/subjects
// @desc    Create new subject
// @access  Admin
router.post('/subjects', async (req, res) => {
  try {
    const { name, description, category, icon, certificateCriteria } = req.body;
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    const subject = await Subject.create({
      name,
      slug,
      description,
      category,
      icon,
      certificateCriteria
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/subjects/:id
// @desc    Update subject
// @access  Admin
router.put('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/subjects/:id
// @desc    Delete subject
// @access  Admin
router.delete('/subjects/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Also delete associated topics and questions
    await Topic.deleteMany({ subject: req.params.id });
    await Question.deleteMany({ subject: req.params.id });

    res.json({ success: true, message: 'Subject and related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TOPIC MANAGEMENT ==========

// @route   GET /api/admin/topics
// @desc    Get all topics with filters
// @access  Admin
router.get('/topics', async (req, res) => {
  try {
    const { subject } = req.query;
    const query = subject ? { subject } : {};
    
    const topics = await Topic.find(query)
      .populate('subject', 'name slug')
      .sort({ subject: 1, name: 1 });

    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/topics
// @desc    Create new topic
// @access  Admin
router.post('/topics', async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    
    // Update subject's total questions count
    await Subject.findByIdAndUpdate(topic.subject, {
      $inc: { totalQuestions: 0 }
    });

    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/topics/:id
// @desc    Update topic
// @access  Admin
router.put('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/topics/:id
// @desc    Delete topic
// @access  Admin
router.delete('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Delete associated questions
    await Question.deleteMany({ topic: req.params.id });

    res.json({ success: true, message: 'Topic and related questions deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== QUESTION MANAGEMENT ==========

// @route   GET /api/admin/questions
// @desc    Get all questions with filters
// @access  Admin
router.get('/questions', async (req, res) => {
  try {
    const { subject, topic, difficulty, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .populate('subject', 'name slug')
      .populate('topic', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: questions,
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

// @route   POST /api/admin/questions
// @desc    Create new question
// @access  Admin
router.post('/questions', async (req, res) => {
  try {
    const questionData = { ...req.body, createdBy: req.user.id };
    const question = await Question.create(questionData);

    // Update topic and subject question counts
    await Topic.findByIdAndUpdate(question.topic, {
      $inc: { questionCount: 1 }
    });
    await Subject.findByIdAndUpdate(question.subject, {
      $inc: { totalQuestions: 1 }
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/questions/bulk
// @desc    Create multiple questions at once
// @access  Admin
router.post('/questions/bulk', async (req, res) => {
  try {
    const { questions } = req.body;
    
    const questionsWithCreator = questions.map(q => ({
      ...q,
      createdBy: req.user.id
    }));

    const createdQuestions = await Question.insertMany(questionsWithCreator);

    // Update counts
    const topicCounts = {};
    const subjectCounts = {};
    
    createdQuestions.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    });

    for (const [topicId, count] of Object.entries(topicCounts)) {
      await Topic.findByIdAndUpdate(topicId, { $inc: { questionCount: count } });
    }

    for (const [subjectId, count] of Object.entries(subjectCounts)) {
      await Subject.findByIdAndUpdate(subjectId, { $inc: { totalQuestions: count } });
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      data: createdQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/questions/:id
// @desc    Update question
// @access  Admin
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question
// @access  Admin
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // Update counts
    await Topic.findByIdAndUpdate(question.topic, {
      $inc: { questionCount: -1 }
    });
    await Subject.findByIdAndUpdate(question.subject, {
      $inc: { totalQuestions: -1 }
    });

    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PLATFORM ANALYTICS ==========

// @route   GET /api/admin/analytics
// @desc    Get platform-wide analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({
      'profile.lastActivityDate': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Quiz statistics
    const totalQuizzes = await Quiz.countDocuments({ status: 'completed' });
    const avgQuizzesPerUser = totalUsers > 0 ? (totalQuizzes / totalUsers).toFixed(2) : 0;

    // Subject-wise performance
    const subjectStats = await Quiz.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$subject',
          totalAttempts: { $sum: 1 },
          avgAccuracy: { $avg: '$results.accuracy' },
          avgScore: { $avg: '$results.marksObtained' }
        }
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject'
        }
      },
      { $unwind: '$subject' },
      {
        $project: {
          name: '$subject.name',
          totalAttempts: 1,
          avgAccuracy: { $round: ['$avgAccuracy', 2] },
          avgScore: { $round: ['$avgScore', 2] }
        }
      }
    ]);

    // Difficulty distribution
    const difficultyStats = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performers
    const topUsers = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          totalQuizzes: '$profile.totalQuizzesTaken',
          accuracy: {
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
      { $sort: { accuracy: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity
    const recentQuizzes = await Quiz.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('subject', 'name')
      .sort({ completedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalQuizzes,
          avgQuizzesPerUser,
          totalQuestions: await Question.countDocuments(),
          totalSubjects: await Subject.countDocuments()
        },
        subjectStats,
        difficultyStats,
        topUsers,
        recentActivity: recentQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

