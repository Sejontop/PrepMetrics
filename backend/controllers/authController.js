const User = require('../models/User');

/**
 * @desc  Register new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const token = user.getSignedJwt();

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = user.getSignedJwt();
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, currentStreak: user.currentStreak },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Get current user profile
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};
