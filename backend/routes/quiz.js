// quiz.js - Quiz results CRUD
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const QuizResult = require('../models/QuizResult');

// In-memory fallback (only used when no DB is connected — e.g. local demo mode)
const memResults = {};

// GET /api/quiz — list current user's quiz results
router.get('/', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const results = await QuizResult.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json({ results });
    }
    return res.json({ results: memResults[req.user.id] || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz — save a quiz attempt result
router.post('/', auth, async (req, res) => {
  try {
    const { topic, difficulty, type, numQ, numQuestions, correct, score, questions } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    if (isDbConnected()) {
      const result = await QuizResult.create({
        user: req.user.id,
        topic,
        difficulty,
        type,
        numQuestions: numQuestions ?? numQ,
        correct,
        score,
        questions,
      });
      return res.status(201).json({ result });
    }

    if (!memResults[req.user.id]) memResults[req.user.id] = [];
    const entry = { id: Date.now(), topic, score, numQ: numQuestions ?? numQ, correct, date: new Date().toISOString() };
    memResults[req.user.id].unshift(entry);
    return res.status(201).json({ result: entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/quiz/:id — remove a quiz result
router.delete('/:id', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      await QuizResult.deleteOne({ _id: req.params.id, user: req.user.id });
      return res.json({ message: 'Deleted' });
    }
    if (memResults[req.user.id]) {
      memResults[req.user.id] = memResults[req.user.id].filter(r => r.id != req.params.id);
    }
    return res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
