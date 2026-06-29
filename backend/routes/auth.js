/**
 * Auth Routes — /api/auth
 * CSE4104-7C-T05 | AI Academic Mentor
 *
 * POST /api/auth/register  — create account
 * POST /api/auth/login     — login, receive JWT
 * GET  /api/auth/me        — get own profile (protected)
 * PUT  /api/auth/profile   — update profile (protected)
 * POST /api/auth/logout    — logout (client-side token deletion)
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

// In-memory fallback (when no MongoDB)
const inMemoryUsers = [];

function signToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret_change_in_production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
      const User = require('../models/User');
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ error: 'Email already registered.' });

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        studentId: studentId || null,
        department: department || 'CSE'
      });

      const token = signToken(user);
      return res.status(201).json({
        message: 'Registration successful.',
        token,
        user
      });
    } catch (dbErr) {
      // Fallback: in-memory
      if (inMemoryUsers.find(u => u.email === email.toLowerCase())) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
      const hash = await bcrypt.hash(password, 12);
      const user = {
        id: 'u_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hash,
        studentId: studentId || null,
        department: department || 'CSE',
        role: 'student',
        isActive: true,
        createdAt: new Date()
      };
      inMemoryUsers.push(user);
      const { password: _, ...safe } = user;
      return res.status(201).json({ message: 'Registration successful (demo mode).', token: signToken(safe), user: safe });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      const User = require('../models/User');
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      if (!user.isActive) return res.status(403).json({ error: 'Account is disabled. Contact admin.' });

      const match = await user.comparePassword(password);
      if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

      user.lastLogin = new Date();
      await user.save();

      const token = signToken(user);
      return res.json({ message: 'Login successful.', token, user });
    } catch (dbErr) {
      const user = inMemoryUsers.find(u => u.email === email.toLowerCase());
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const { password: _, ...safe } = user;
      return res.json({ message: 'Login successful (demo mode).', token: signToken(safe), user: safe });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json({ user });
    } catch {
      const user = inMemoryUsers.find(u => u.id === req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      const { password: _, ...safe } = user;
      return res.json({ user: safe });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, studentId, department } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (studentId) updates.studentId = studentId.trim();
    if (department) updates.department = department.trim();

    try {
      const User = require('../models/User');
      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json({ message: 'Profile updated.', user });
    } catch (dbErr) {
      const idx = inMemoryUsers.findIndex(u => u.id === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'User not found.' });
      Object.assign(inMemoryUsers[idx], updates);
      const { password: _, ...safe } = inMemoryUsers[idx];
      return res.json({ message: 'Profile updated (demo mode).', user: safe });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', auth, (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ message: 'Logged out successfully. Please delete your token on the client side.' });
});

module.exports = router;
