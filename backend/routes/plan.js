/**
 * Study Plan Routes — /api/plan
 * CSE4104-7C-T05 | AI Academic Mentor
 *
 * GET    /api/plan       — list user's plans
 * POST   /api/plan       — save a plan
 * GET    /api/plan/:id   — get single plan
 * PUT    /api/plan/:id   — update plan
 * DELETE /api/plan/:id   — delete plan
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const inMemoryPlans = {};

// ── GET /api/plan ─────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const StudyPlan = require('../models/StudyPlan');
    const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ plans, count: plans.length });
  } catch {
    const plans = inMemoryPlans[req.user.id] || [];
    res.json({ plans, count: plans.length });
  }
});

// ── POST /api/plan ────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, subjects, days, goal, hoursPerDay, level } = req.body;

    try {
      const StudyPlan = require('../models/StudyPlan');
      const plan = await StudyPlan.create({
        user: req.user.id,
        title: title || 'My Study Plan',
        subjects: subjects || [],
        days: days || [],
        goal: goal || 'revision',
        hoursPerDay: hoursPerDay || 3,
        level: level || 'intermediate'
      });
      return res.status(201).json({ plan });
    } catch (dbErr) {
      if (!inMemoryPlans[req.user.id]) inMemoryPlans[req.user.id] = [];
      const plan = { id: Date.now().toString(), title, subjects, days, goal, hoursPerDay, level, createdAt: new Date().toISOString() };
      inMemoryPlans[req.user.id].unshift(plan);
      return res.status(201).json({ plan });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/plan/:id ─────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const StudyPlan = require('../models/StudyPlan');
    const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id });
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ plan });
  } catch {
    const plans = inMemoryPlans[req.user.id] || [];
    const plan = plans.find(p => p.id === req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ plan });
  }
});

// ── PUT /api/plan/:id ─────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const StudyPlan = require('../models/StudyPlan');
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ plan });
  } catch {
    res.status(500).json({ error: 'Update failed.' });
  }
});

// ── DELETE /api/plan/:id ──────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const StudyPlan = require('../models/StudyPlan');
    const deleted = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Plan not found.' });
    res.json({ message: 'Plan deleted.' });
  } catch {
    if (inMemoryPlans[req.user.id]) {
      inMemoryPlans[req.user.id] = inMemoryPlans[req.user.id].filter(p => p.id !== req.params.id);
    }
    res.json({ message: 'Plan deleted (demo mode).' });
  }
});

module.exports = router;
