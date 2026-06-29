// progress.js - Progress dashboard analytics
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const QuizResult = require('../models/QuizResult');
const StudyPlan = require('../models/StudyPlan');
const Summary = require('../models/Summary');

// GET /api/progress — real analytics for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        message: 'No database connected — analytics unavailable in demo mode',
        quizzesTaken: 0,
        averageScore: 0,
        plansCreated: 0,
        summariesSaved: 0,
        recentQuizzes: [],
        topicBreakdown: [],
      });
    }

    const userId = req.user.id;
    const [quizzes, plansCreated, summariesSaved] = await Promise.all([
      QuizResult.find({ user: userId }).sort({ createdAt: -1 }),
      StudyPlan.countDocuments({ user: userId }),
      Summary.countDocuments({ user: userId }),
    ]);

    const quizzesTaken = quizzes.length;
    const averageScore = quizzesTaken
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzesTaken)
      : 0;

    // Per-topic performance breakdown
    const topicMap = {};
    for (const q of quizzes) {
      if (!topicMap[q.topic]) topicMap[q.topic] = { topic: q.topic, attempts: 0, totalScore: 0 };
      topicMap[q.topic].attempts += 1;
      topicMap[q.topic].totalScore += q.score || 0;
    }
    const topicBreakdown = Object.values(topicMap).map(t => ({
      topic: t.topic,
      attempts: t.attempts,
      averageScore: Math.round(t.totalScore / t.attempts),
    }));

    res.json({
      quizzesTaken,
      averageScore,
      plansCreated,
      summariesSaved,
      recentQuizzes: quizzes.slice(0, 5),
      topicBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
