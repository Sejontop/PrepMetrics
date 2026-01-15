// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// @route   GET /api/questions
// @desc    Get questions with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      subject, 
      topic, 
      difficulty, 
      limit = 20, 
      page = 1,
      random = false 
    } = req.query;
    
    const query = { isActive: true };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;

    let questions;
    
    if (random === 'true') {
      // For random selection (used in quiz generation)
      const count = await Question.countDocuments(query);
      const randomSkip = Math.floor(Math.random() * Math.max(count - limit, 0));
      
      questions = await Question.find(query)
        .populate('subject', 'name slug')
        .populate('topic', 'name')
        .select('-stats')
        .skip(randomSkip)
        .limit(parseInt(limit));
    } else {
      questions = await Question.find(query)
        .populate('subject', 'name slug')
        .populate('topic', 'name')
        .select('-stats')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);
    }

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

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('subject', 'name slug category')
      .populate('topic', 'name');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/questions/random/:subjectId
// @desc    Get random questions for practice
// @access  Private
router.get('/random/:subjectId', protect, async (req, res) => {
  try {
    const { count = 10, difficulty, topics } = req.query;
    
    const query = { 
      subject: req.params.subjectId, 
      isActive: true 
    };
    
    if (difficulty && difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }
    
    if (topics) {
      query.topic = { $in: topics.split(',') };
    }

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    // Populate after aggregation
    await Question.populate(questions, [
      { path: 'subject', select: 'name slug' },
      { path: 'topic', select: 'name' }
    ]);

    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/questions/stats/:subjectId
// @desc    Get question statistics for a subject
// @access  Private
router.get('/stats/:subjectId', protect, async (req, res) => {
  try {
    const stats = await Question.aggregate([
      { 
        $match: { 
          subject: mongoose.Types.ObjectId(req.params.subjectId), 
          isActive: true 
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byDifficulty: {
            $push: {
              difficulty: '$difficulty',
              count: 1
            }
          },
          avgAttempts: { $avg: '$stats.totalAttempts' },
          avgCorrectRate: {
            $avg: {
              $cond: [
                { $gt: ['$stats.totalAttempts', 0] },
                { $divide: ['$stats.correctAttempts', '$stats.totalAttempts'] },
                0
              ]
            }
          }
        }
      }
    ]);

    // Get topic-wise distribution
    const topicStats = await Question.aggregate([
      { 
        $match: { 
          subject: mongoose.Types.ObjectId(req.params.subjectId), 
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topicDetails'
        }
      },
      { $unwind: '$topicDetails' },
      {
        $project: {
          topicName: '$topicDetails.name',
          count: 1
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: {
        overall: stats[0] || {},
        byTopic: topicStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/questions/validate
// @desc    Validate question answer
// @access  Private
router.post('/validate', protect, async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isCorrect = userAnswer === question.correctAnswer;

    res.json({ 
      success: true, 
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;