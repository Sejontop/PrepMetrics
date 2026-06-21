const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { computeReadiness, updateStreak } = require('../utils/analyticsEngine');

/**
 * @desc  Submit a quiz attempt
 * @route POST /api/attempts
 */
exports.submitAttempt = async (req, res) => {
  try {
    const { quizId, subjectId, responses, timeTakenSec } = req.body;
    // responses: [{ questionId, selectedOption, timeTakenSec }]

    // Fetch correct answers from DB
    const questionIds = responses.map(r => r.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const qMap = Object.fromEntries(questions.map(q => [q._id.toString(), q]));

    let correctCount = 0;
    const detailedResponses = responses.map(r => {
      const q = qMap[r.questionId];
      if (!q) return null;
      const isCorrect = q.options[r.selectedOption]?.isCorrect === true;
      if (isCorrect) correctCount++;

      // Update question analytics
      Question.findByIdAndUpdate(r.questionId, {
        $inc: { totalAttempts: 1, totalCorrect: isCorrect ? 1 : 0 },
      }).exec();

      return {
        question:       r.questionId,
        selectedOption: r.selectedOption,
        isCorrect,
        timeTakenSec:   r.timeTakenSec || 0,
        difficulty:     q.difficulty,
        topic:          q.topic,
      };
    }).filter(Boolean);

    const score = Math.round((correctCount / detailedResponses.length) * 100);
    const quiz  = await Quiz.findById(quizId);
    const passed = score >= (quiz?.passingScore || 60);

    // Compute interview readiness for this subject
    const prevAttempts = await Attempt.find({ user: req.user.id, subject: subjectId }).sort('-completedAt').limit(5);
    const readinessScore = computeReadiness(prevAttempts, score);

    const attempt = await Attempt.create({
      user:           req.user.id,
      quiz:           quizId,
      subject:        subjectId,
      responses:      detailedResponses,
      totalQuestions: detailedResponses.length,
      correctAnswers: correctCount,
      score,
      timeTakenSec,
      passed,
      readinessScore,
    });

    // Update user aggregate + streak
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalAttempts: 1, totalScore: score, totalQuestions: detailedResponses.length },
    });
    await updateStreak(req.user.id);

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Get user's attempt history
 * @route GET /api/attempts/my
 */
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate('quiz', 'title')
      .populate('subject', 'name icon color')
      .sort('-completedAt')
      .limit(50);
    res.json({ success: true, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Get a single attempt with full details
 * @route GET /api/attempts/:id
 */
exports.getAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quiz', 'title timeLimitMin')
      .populate('subject', 'name icon color')
      .populate({ path: 'responses.question', select: 'text options explanation difficulty' })
      .populate({ path: 'responses.topic', select: 'name' });

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
