const User = require('../models/User');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt').select('-password');
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Subject CRUD
exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: subject });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Subject deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Topic CRUD
exports.createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Question CRUD
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: question });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const questions = await Question.find(filter)
      .populate('subject', 'name').populate('topic', 'name').sort('-createdAt');
    res.json({ success: true, data: questions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
