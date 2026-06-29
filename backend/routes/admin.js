// admin.js - Admin dashboard endpoints
const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const StudyPlan = require('../models/StudyPlan');

// GET /api/admin/stats — platform-wide counts
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ message: 'No database connected', timestamp: new Date().toISOString() });
    }
    const [totalUsers, totalQuizzes, totalPlans] = await Promise.all([
      User.countDocuments(),
      QuizResult.countDocuments(),
      StudyPlan.countDocuments(),
    ]);
    res.json({ totalUsers, totalQuizzes, totalPlans, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — list all users (password excluded by schema's select:false)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ users: [], message: 'No database connected' });
    }
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
