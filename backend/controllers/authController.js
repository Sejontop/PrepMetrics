const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
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

/**
 * @desc  Forgot password - Send reset link
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
      if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.log('\n==================================================');
        console.log('✉️ DEVELOPMENT MODE: SMTP is not configured.');
        console.log('Use the link below to reset the password:');
        console.log(resetUrl);
        console.log('==================================================\n');

        return res.json({
          success: true,
          message: 'Reset link generated! (Logged to backend server console for local development)',
        });
      }

      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });

      res.json({
        success: true,
        message: 'Reset link sent to your email',
      });
    } catch (err) {
      console.error('SMTP Email sending failed:', err);
      console.log('\n==================================================');
      console.log('✉️ FALLBACK: SMTP failed to send email.');
      console.log('Use the link below to reset the password:');
      console.log(resetUrl);
      console.log('==================================================\n');

      return res.json({
        success: true,
        message: 'SMTP failed to send, but reset link was logged to backend server console.',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc  Reset password using token
 * @route PUT /api/auth/reset-password/:resetToken
 */
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      return res.status(400).json({ success: false, message: 'Please provide password' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Hash token to match database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwt();
    res.json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};