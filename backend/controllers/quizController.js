const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

/**
 * @desc  Get all quizzes (optionally filter by subject/difficulty)
 * @route GET /api/quizzes
 */
exports.getQuizzes = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.subject)    filter.subject    = req.query.subject;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const quizzes = await Quiz.find(filter)
      .populate('subject', 'name slug icon color')
      .populate('topic', 'name')
      .sort('createdAt');

    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Get single quiz with questions (options, no correct answer exposed)
 * @route GET /api/quizzes/:id
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('subject', 'name slug icon color')
      .populate({
        path: 'questions',
        select: '-options.isCorrect -explanation',
        populate: { path: 'topic', select: 'name' },
      });

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Generate a dynamic quiz from filters
 * @route POST /api/quizzes/generate
 */
exports.generateQuiz = async (req, res) => {
  try {
    const { subjectId, topicId, difficulty, count = 10, isTimed = true } = req.body;

    const filter = { isActive: true };
    if (subjectId)  filter.subject    = new mongoose.Types.ObjectId(subjectId);
    if (topicId)    filter.topic      = new mongoose.Types.ObjectId(topicId);
    if (difficulty && difficulty !== 'mixed') filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } },
    ]);

    if (questions.length === 0)
      return res.status(404).json({ success: false, message: 'No questions found for these filters' });

    // Build a transient quiz object (not persisted)
    res.json({
      success: true,
      data: {
        questions: questions.map(q => ({
          ...q,
          options: q.options.map(({ text }) => ({ text })), // strip isCorrect
        })),
        isTimed,
        timeLimitMin: isTimed ? Math.ceil(questions.length * 1.5) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Admin – create quiz
 * @route POST /api/quizzes
 */
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Quiz deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
