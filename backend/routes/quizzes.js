// routes/quizzes.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');
const { calculateInterviewReadiness } = require('../utils/analytics');

// @route   POST /api/quizzes/generate
// @desc    Generate a new quiz
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { subjectId, difficulty, mode, questionCount, topics } = req.body;

    // Build query
    const query = { subject: subjectId, isActive: true };
    if (difficulty !== 'mixed') query.difficulty = difficulty;
    if (topics && topics.length > 0) query.topic = { $in: topics };

    // Fetch questions
    let questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: questionCount || 10 } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this criteria' });
    }

    // Calculate total time limit
    const totalTimeLimit = mode === 'timed' 
      ? questions.reduce((sum, q) => sum + q.timeLimit, 0) 
      : null;

    // Create quiz
    const quiz = await Quiz.create({
      user: req.user.id,
      subject: subjectId,
      quizConfig: {
        mode,
        difficulty,
        questionCount: questions.length,
        timeLimit: totalTimeLimit,
        topics: topics || []
      },
      questions: questions.map(q => ({
        question: q._id,
        timeSpent: 0,
        marksAwarded: 0
      })),
      status: 'in-progress'
    });

    // Populate quiz data
    await quiz.populate([
      { path: 'questions.question', select: '-stats -createdBy' },
      { path: 'subject', select: 'name slug category' }
    ]);

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/quizzes/:id/submit
// @desc    Submit quiz answers and calculate results
// @access  Private
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, userAnswer, timeSpent }
    
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id })
      .populate('questions.question');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Quiz already submitted' });
    }

    // Process answers and calculate results
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;
    let totalMarks = 0;
    let marksObtained = 0;
    let totalTimeSpent = 0;
    
    const topicScores = {};
    const difficultyScores = { easy: {}, medium: {}, hard: {} };

    quiz.questions.forEach((item, index) => {
      const question = item.question;
      const answer = answers.find(a => a.questionId === question._id.toString());
      
      totalMarks += question.marks;
      
      if (!answer || !answer.userAnswer) {
        item.skipped = true;
        skippedQuestions++;
      } else {
        item.userAnswer = answer.userAnswer;
        item.timeSpent = answer.timeSpent || 0;
        totalTimeSpent += item.timeSpent;
        
        // Check if answer is correct
        item.isCorrect = answer.userAnswer === question.correctAnswer;
        
        if (item.isCorrect) {
          correctAnswers++;
          item.marksAwarded = question.marks;
          marksObtained += question.marks;
        } else {
          incorrectAnswers++;
        }

        // Update question stats
        Question.findByIdAndUpdate(question._id, {
          $inc: { 
            'stats.totalAttempts': 1,
            'stats.correctAttempts': item.isCorrect ? 1 : 0
          }
        }).exec();
      }

      // Topic-wise score tracking
      const topicId = question.topic.toString();
      if (!topicScores[topicId]) {
        topicScores[topicId] = { total: 0, correct: 0 };
      }
      topicScores[topicId].total++;
      if (item.isCorrect) topicScores[topicId].correct++;

      // Difficulty-wise score tracking
      if (!difficultyScores[question.difficulty].total) {
        difficultyScores[question.difficulty] = { total: 0, correct: 0 };
      }
      difficultyScores[question.difficulty].total++;
      if (item.isCorrect) difficultyScores[question.difficulty].correct++;
    });

    // Calculate accuracy
    const attemptedQuestions = quiz.questions.length - skippedQuestions;
    const accuracy = attemptedQuestions > 0 
      ? (correctAnswers / attemptedQuestions) * 100 
      : 0;

    // Update quiz results
    quiz.results = {
      totalQuestions: quiz.questions.length,
      attemptedQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      totalMarks,
      marksObtained,
      accuracy: Math.round(accuracy * 100) / 100,
      totalTimeSpent,
      averageTimePerQuestion: attemptedQuestions > 0 
        ? Math.round(totalTimeSpent / attemptedQuestions) 
        : 0
    };

    // Calculate performance metrics
    quiz.performance.topicWiseScore = Object.keys(topicScores).map(topicId => ({
      topic: topicId,
      total: topicScores[topicId].total,
      correct: topicScores[topicId].correct,
      accuracy: (topicScores[topicId].correct / topicScores[topicId].total) * 100
    }));

    quiz.performance.difficultyWiseScore = {
      easy: {
        total: difficultyScores.easy.total || 0,
        correct: difficultyScores.easy.correct || 0,
        accuracy: difficultyScores.easy.total 
          ? (difficultyScores.easy.correct / difficultyScores.easy.total) * 100 
          : 0
      },
      medium: {
        total: difficultyScores.medium.total || 0,
        correct: difficultyScores.medium.correct || 0,
        accuracy: difficultyScores.medium.total 
          ? (difficultyScores.medium.correct / difficultyScores.medium.total) * 100 
          : 0
      },
      hard: {
        total: difficultyScores.hard.total || 0,
        correct: difficultyScores.hard.correct || 0,
        accuracy: difficultyScores.hard.total 
          ? (difficultyScores.hard.correct / difficultyScores.hard.total) * 100 
          : 0
      }
    };

    quiz.status = 'completed';
    quiz.completedAt = new Date();
    await quiz.save();

    // Update user profile and subject progress
    await updateUserProgress(req.user.id, quiz);

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/quizzes/history
// @desc    Get user's quiz history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { subject, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user.id, status: 'completed' };
    if (subject) query.subject = subject;

    const quizzes = await Quiz.find(query)
      .populate('subject', 'name slug category')
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: quizzes,
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

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID with detailed results
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id })
      .populate([
        { path: 'subject', select: 'name slug category' },
        { path: 'questions.question' },
        { path: 'performance.topicWiseScore.topic', select: 'name' }
      ]);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to update user progress
async function updateUserProgress(userId, quiz) {
  const user = await User.findById(userId);
  
  // Update streak
  user.updateStreak();
  
  // Update overall stats
  user.profile.totalQuizzesTaken += 1;
  user.profile.totalQuestionsAttempted += quiz.results.attemptedQuestions;
  user.profile.totalCorrectAnswers += quiz.results.correctAnswers;

  // Update subject-specific progress
  let subjectProgress = user.subjectProgress.find(
    sp => sp.subject.toString() === quiz.subject.toString()
  );

  if (!subjectProgress) {
    subjectProgress = {
      subject: quiz.subject,
      quizzesCompleted: 0,
      totalScore: 0,
      averageAccuracy: 0,
      timeSpent: 0,
      strengthTopics: [],
      weakTopics: []
    };
    user.subjectProgress.push(subjectProgress);
  }

  subjectProgress.quizzesCompleted += 1;
  subjectProgress.totalScore += quiz.results.marksObtained;
  subjectProgress.timeSpent += quiz.results.totalTimeSpent;
  subjectProgress.lastAttemptDate = new Date();
  
  // Calculate average accuracy
  const allQuizzes = await Quiz.find({
    user: userId,
    subject: quiz.subject,
    status: 'completed'
  });
  
  const avgAccuracy = allQuizzes.reduce((sum, q) => sum + q.results.accuracy, 0) / allQuizzes.length;
  subjectProgress.averageAccuracy = Math.round(avgAccuracy * 100) / 100;

  // Calculate interview readiness score
  subjectProgress.interviewReadinessScore = calculateInterviewReadiness(subjectProgress, allQuizzes);

  // Identify strength and weak topics
  const topicPerformance = quiz.performance.topicWiseScore;
  subjectProgress.strengthTopics = topicPerformance
    .filter(t => t.accuracy >= 75)
    .map(t => t.topic.toString());
  subjectProgress.weakTopics = topicPerformance
    .filter(t => t.accuracy < 50)
    .map(t => t.topic.toString());

  // Check certificate eligibility
  const subject = await Subject.findById(quiz.subject);
  if (
    subjectProgress.quizzesCompleted >= subject.certificateCriteria.minimumQuizzes &&
    subjectProgress.averageAccuracy >= subject.certificateCriteria.minimumAccuracy &&
    !subjectProgress.certificateEarned
  ) {
    subjectProgress.certificateEarned = true;
    subjectProgress.certificateDate = new Date();
    // Trigger certificate generation (handled in certificate route)
  }

  await user.save();
  
  // Update subject stats
  await Subject.findByIdAndUpdate(quiz.subject, {
    $inc: { 'stats.totalAttempts': 1 }
  });
}

module.exports = router;

