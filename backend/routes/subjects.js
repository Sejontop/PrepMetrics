// routes/subjects.js
const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all active subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;

    const subjects = await Subject.find(query).sort({ category: 1, name: 1 });

    // Group by category
    const groupedSubjects = subjects.reduce((acc, subject) => {
      if (!acc[subject.category]) {
        acc[subject.category] = [];
      }
      acc[subject.category].push(subject);
      return acc;
    }, {});

    res.json({ 
      success: true, 
      data: subjects,
      grouped: groupedSubjects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/categories
// @desc    Get all subject categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Subject.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID with details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get topics count
    const topicsCount = await Topic.countDocuments({ 
      subject: subject._id, 
      isActive: true 
    });

    // Get difficulty distribution
    const difficultyDistribution = await Question.aggregate([
      { $match: { subject: subject._id, isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const subjectData = {
      ...subject.toObject(),
      topicsCount,
      difficultyDistribution: {
        easy: difficultyDistribution.find(d => d._id === 'easy')?.count || 0,
        medium: difficultyDistribution.find(d => d._id === 'medium')?.count || 0,
        hard: difficultyDistribution.find(d => d._id === 'hard')?.count || 0
      }
    };

    res.json({ success: true, data: subjectData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/slug/:slug
// @desc    Get subject by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get topics for this subject
    const topics = await Topic.find({ 
      subject: subject._id, 
      isActive: true 
    }).select('name description difficulty questionCount');

    res.json({ 
      success: true, 
      data: {
        subject,
        topics
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/:id/topics
// @desc    Get all topics for a subject
// @access  Public
router.get('/:id/topics', async (req, res) => {
  try {
    const topics = await Topic.find({ 
      subject: req.params.id, 
      isActive: true 
    }).sort({ name: 1 });

    res.json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/subjects/:id/stats
// @desc    Get subject statistics
// @access  Private
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Get user's progress for this subject
    const user = await User.findById(req.user.id);
    const userProgress = user.subjectProgress.find(
      sp => sp.subject.toString() === req.params.id
    );

    // Get total questions by difficulty
    const questionsByDifficulty = await Question.aggregate([
      { $match: { subject: subject._id, isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Get topics with question counts
    const topics = await Topic.find({ 
      subject: subject._id, 
      isActive: true 
    }).select('name questionCount');

    const stats = {
      subject: {
        id: subject._id,
        name: subject.name,
        totalQuestions: subject.totalQuestions
      },
      userProgress: userProgress || null,
      questionsByDifficulty,
      topics,
      certificateEligible: userProgress?.certificateEarned || false
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
