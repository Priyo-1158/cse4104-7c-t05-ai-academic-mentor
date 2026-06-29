// summary.js - AI note summaries CRUD
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const Summary = require('../models/Summary');

const memSummaries = {};

// GET /api/summary — list current user's saved summaries
router.get('/', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const summaries = await Summary.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json({ summaries });
    }
    return res.json({ summaries: memSummaries[req.user.id] || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/summary — save a generated summary
router.post('/', auth, async (req, res) => {
  try {
    const { subject, style, notes, originalNotes, summary } = req.body;
    const original = originalNotes ?? notes;
    if (!original || !summary) return res.status(400).json({ error: 'original notes and summary are required' });

    if (isDbConnected()) {
      const doc = await Summary.create({ user: req.user.id, subject, style, originalNotes: original, summary });
      return res.status(201).json({ summary: doc });
    }

    if (!memSummaries[req.user.id]) memSummaries[req.user.id] = [];
    const entry = { id: Date.now(), subject, style, originalNotes: original, summary, date: new Date().toISOString() };
    memSummaries[req.user.id].unshift(entry);
    return res.status(201).json({ summary: entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
