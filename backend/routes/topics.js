// routes/topics.js
const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// @route   GET /api/topics
// @desc    Get topics with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    
    const query = { isActive: true };
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const topics = await Topic.find(query)
      .populate('subject', 'name slug category')
      .sort({ name: 1 });

    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/topics/:id
// @desc    Get topic by ID with details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('subject', 'name slug category');

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    // Get question statistics for this topic
    const questionStats = await Question.aggregate([
      { $match: { topic: topic._id, isActive: true } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgAttempts: { $avg: '$stats.totalAttempts' },
          avgCorrect: { $avg: '$stats.correctAttempts' }
        }
      }
    ]);

    const topicData = {
      ...topic.toObject(),
      questionStats
    };

    res.json({ success: true, data: topicData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/topics/:id/questions
// @desc    Get all questions for a topic
// @access  Private
router.get('/:id/questions', protect, async (req, res) => {
  try {
    const { difficulty, limit = 20, page = 1 } = req.query;
    
    const query = { topic: req.params.id, isActive: true };
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .select('-stats -createdBy')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
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

// @route   GET /api/topics/subject/:subjectId
// @desc    Get all topics for a subject
// @access  Public
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const topics = await Topic.find({ 
      subject: req.params.subjectId, 
      isActive: true 
    }).sort({ name: 1 });

    // Group by difficulty if needed
    const groupedByDifficulty = {
      easy: topics.filter(t => t.difficulty === 'easy'),
      medium: topics.filter(t => t.difficulty === 'medium'),
      hard: topics.filter(t => t.difficulty === 'hard'),
      all: topics.filter(t => !t.difficulty)
    };

    res.json({ 
      success: true, 
      data: topics,
      grouped: groupedByDifficulty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;