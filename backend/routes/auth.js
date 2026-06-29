const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');
const { isDbConnected } = require('../utils/db');
const User = require('../models/User');

// In-memory fallback when no MongoDB is connected (local demo mode only)
const inMemoryUsers = [];

function signToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId, department, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Determine role server-side. The admin code is never checked in the
    // frontend — only here, against an env secret the client never sees.
    let role = 'student';
    if (adminCode) {
      if (!process.env.ADMIN_ACCESS_CODE || adminCode !== process.env.ADMIN_ACCESS_CODE) {
        return res.status(403).json({ error: 'Invalid admin access code.' });
      }
      role = 'admin';
    }

    if (isDbConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const user = await User.create({ name, email, password, studentId, department, role });
      const token = signToken(user);
      return res.status(201).json({ token, user });
    }

    // Demo fallback — no DB connected
    if (inMemoryUsers.find(u => u.email === email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = {
      id: 'u_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hash,
      studentId,
      department: department || 'CSE',
      role,
      createdAt: new Date(),
    };
    inMemoryUsers.push(user);
    const { password: _pw, ...safe } = user;
    const token = signToken(safe);
    return res.status(201).json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user.lastLogin = new Date();
      await user.save();
      const token = signToken(user);
      return res.json({ token, user });
    }

    // Demo fallback — no DB connected
    const user = inMemoryUsers.find(u => u.email === email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _pw, ...safe } = user;
    return res.json({ token: signToken(safe), user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    }
    const user = inMemoryUsers.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/profile — same data as /me, named to match the course spec
router.get('/profile', auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    }
    const user = inMemoryUsers.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile — update name, department, studentId (not email/password/role here)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, studentId } = req.body;
    const updates = {};
    if (name !== undefined) {
      if (!name.trim() || name.trim().length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
      updates.name = name.trim();
    }
    if (department !== undefined) updates.department = department;
    if (studentId !== undefined) updates.studentId = studentId;

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    }

    const user = inMemoryUsers.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    Object.assign(user, updates);
    const { password: _pw, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
// With stateless JWT there's no server-side session to destroy — the standard
// pattern is: confirm the call, and the client deletes its stored token.
// This endpoint exists so the frontend has a real call to make on sign-out,
// and so the API surface matches what was specified (POST /logout).
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
