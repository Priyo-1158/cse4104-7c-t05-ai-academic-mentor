// plan.js - Study plan CRUD
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const StudyPlan = require('../models/StudyPlan');

const memPlans = {};

// GET /api/plan — list current user's study plans
router.get('/', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json({ plans });
    }
    return res.json({ plans: memPlans[req.user.id] || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/plan — save a generated study plan
router.post('/', auth, async (req, res) => {
  try {
    const { title, subjects, days, hoursPerDay, goal, level, extraNotes, plan, planData } = req.body;
    const data = planData ?? plan;
    if (!subjects || !data) return res.status(400).json({ error: 'subjects and plan data are required' });

    if (isDbConnected()) {
      const studyPlan = await StudyPlan.create({
        user: req.user.id,
        title,
        subjects,
        days,
        hoursPerDay,
        goal,
        level,
        extraNotes,
        planData: data,
      });
      return res.status(201).json({ plan: studyPlan });
    }

    if (!memPlans[req.user.id]) memPlans[req.user.id] = [];
    const entry = { id: Date.now(), title, subjects, days, hoursPerDay, goal, level, planData: data, date: new Date().toISOString() };
    memPlans[req.user.id].unshift(entry);
    return res.status(201).json({ plan: entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
