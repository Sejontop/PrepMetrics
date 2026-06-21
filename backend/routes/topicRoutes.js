const router = require('express').Router();
const Topic = require('../models/Topic');
router.get('/', async (req, res) => {
  const filter = { isActive: true };
  if (req.query.subject) filter.subject = req.query.subject;
  const topics = await Topic.find(filter).populate('subject', 'name');
  res.json({ success: true, data: topics });
});
module.exports = router;
