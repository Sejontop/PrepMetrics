const router = require('express').Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
});
router.put('/profile', protect, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, avatar }, { new: true });
  res.json({ success: true, data: user });
});
module.exports = router;
