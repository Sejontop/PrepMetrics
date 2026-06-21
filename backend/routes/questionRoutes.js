const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Question = require('../models/Question');
router.get('/', protect, async (req, res) => {
  const filter = { isActive: true };
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.topic) filter.topic = req.query.topic;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  const q = await Question.find(filter).populate('topic', 'name').select('-options.isCorrect -explanation');
  res.json({ success: true, data: q });
});
module.exports = router;
