const router = require('express').Router();
const { protect } = require('../middleware/auth');
const Subject = require('../models/Subject');
router.get('/', async (req, res) => {
  const subjects = await Subject.find({ isActive: true }).sort('order');
  res.json({ success: true, data: subjects });
});
router.get('/:id', async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: subject });
});
module.exports = router;
