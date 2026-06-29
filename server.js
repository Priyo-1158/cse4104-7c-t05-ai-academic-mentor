/**
 * AI Academic Mentor — Express Backend
 * CSE4104-7C-T05 | NUBTK 2026
 * ============================================
 * This backend provides the REST API for the
 * AI Academic Mentor application.
 *
 * For the frontend-only demo, all features work
 * via localStorage + direct Gemini API calls.
 * This backend is for production deployment.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// AI rate limit (stricter)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'AI rate limit exceeded. Please wait a moment.' }
});

// ============ DATABASE ============
const mongoose = require('mongoose');

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));
} else {
  console.log('⚠ No MONGODB_URI set — running without database (demo mode)');
}

// ============ ROUTES ============
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/ai',       aiLimiter, require('./routes/ai')); // AI rate limiter applied globally
app.use('/api/quiz',     require('./routes/quiz'));
app.use('/api/plan',     require('./routes/plan'));
app.use('/api/summary',  require('./routes/summary'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/admin',    require('./routes/admin'));

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'AI Academic Mentor',
    team: 'CSE4104-7C-T05',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'AI Academic Mentor API — CSE4104-7C-T05 | NUBTK 2026',
    docs: '/api/health',
    endpoints: ['/api/auth', '/api/ai', '/api/quiz', '/api/plan', '/api/summary', '/api/progress', '/api/admin']
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler — catches anything thrown/passed via next(err), including
// malformed JSON bodies thrown by express.json() before any route runs.
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// ============ START ============
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   AI Academic Mentor API Server      ║
  ║   CSE4104-7C-T05 | NUBTK 2026       ║
  ╠══════════════════════════════════════╣
  ║   🚀 Running on port: ${PORT}           ║
  ║   🌍 Mode: ${(process.env.NODE_ENV||'development').padEnd(26)}║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
