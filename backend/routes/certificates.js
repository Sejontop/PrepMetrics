// routes/certificates.js
const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

// @route   POST /api/certificates/generate/:subjectId
// @desc    Generate certificate for a subject
// @access  Private
router.post('/generate/:subjectId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.params;

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ user: userId, subject: subjectId });
    if (existingCert) {
      return res.status(400).json({ 
        success: false, 
        message: 'Certificate already generated for this subject' 
      });
    }

    // Get user's subject progress
    const user = await User.findById(userId);
    const subjectProgress = user.subjectProgress.find(
      sp => sp.subject.toString() === subjectId
    );

    if (!subjectProgress || !subjectProgress.certificateEarned) {
      return res.status(400).json({
        success: false,
        message: 'You have not met the criteria for this certificate'
      });
    }

    const subject = await Subject.findById(subjectId);

    // Generate unique certificate ID
    const certificateId = `PREP-${subject.slug.toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create certificate
    const certificate = await Certificate.create({
      user: userId,
      subject: subjectId,
      certificateId,
      performanceData: {
        totalQuizzes: subjectProgress.quizzesCompleted,
        averageAccuracy: subjectProgress.averageAccuracy,
        totalQuestionsAttempted: user.profile.totalQuestionsAttempted,
        overallScore: subjectProgress.totalScore,
        topicsCovered: subjectProgress.strengthTopics.length
      },
      verification: {
        isVerified: true,
        verificationUrl: `${process.env.CLIENT_URL}/verify/${certificateId}`
      }
    });

    await certificate.populate([
      { path: 'user', select: 'name email' },
      { path: 'subject', select: 'name category' }
    ]);

    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/certificates/my-certificates
// @desc    Get user's certificates
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('subject', 'name slug category icon')
      .sort({ issuedDate: -1 });

    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/certificates/verify/:certificateId
// @desc    Verify certificate authenticity
// @access  Public
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId 
    })
    .populate('user', 'name email')
    .populate('subject', 'name category');

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    res.json({
      success: true,
      data: {
        isValid: certificate.verification.isVerified,
        holderName: certificate.user.name,
        subject: certificate.subject.name,
        category: certificate.subject.category,
        issuedDate: certificate.issuedDate,
        performanceData: certificate.performanceData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;