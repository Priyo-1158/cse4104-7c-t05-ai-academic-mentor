const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const aiLimit = rateLimit({ windowMs: 60000, max: 30, message: { error: 'AI rate limit. Wait a moment.' } });

async function callGemini(prompt, systemCtx = '', apiKey = null) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('No Gemini API key configured');

  const contents = systemCtx
    ? [{ role: 'user', parts: [{ text: systemCtx + '\n\n' + prompt }] }]
    : [{ role: 'user', parts: [{ text: prompt }] }];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// POST /api/ai/chat — multi-turn chat
router.post('/chat', auth, aiLimit, async (req, res) => {
  try {
    const { messages, apiKey } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'Messages required' });

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) return res.status(400).json({ error: 'No API key provided' });

    const contents = messages.map(m => ({
      role: m.role === 'ai' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const fetchRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: 'You are AI Academic Mentor, an intelligent academic assistant for university students. Provide clear, accurate, university-level educational responses.' }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );
    if (!fetchRes.ok) { const e = await fetchRes.json().catch(()=>{}); return res.status(fetchRes.status).json({ error: e?.error?.message || 'Gemini error' }); }
    const data = await fetchRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/quiz — generate quiz
router.post('/quiz', auth, aiLimit, async (req, res) => {
  try {
    const { topic, numQuestions = 5, difficulty = 'medium', type = 'mcq', apiKey } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic required' });
    const typeDesc = type === 'mcq' ? 'multiple choice with 4 options (A,B,C,D)' : type === 'truefalse' ? 'True/False' : 'mixed';
    const prompt = `Create a ${difficulty} ${numQuestions}-question quiz about "${topic}" for a university CSE student.
Return ONLY a valid JSON array, no markdown, no explanation:
[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]
Generate ${numQuestions} ${typeDesc} questions about: ${topic}`;
    const raw = await callGemini(prompt, '', apiKey);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'Invalid AI response format' });
    const questions = JSON.parse(match[0]);
    res.json({ questions, topic, difficulty, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/summarize — summarize notes
router.post('/summarize', auth, aiLimit, async (req, res) => {
  try {
    const { notes, subject, style = 'concise', apiKey } = req.body;
    if (!notes || notes.length < 50) return res.status(400).json({ error: 'Notes too short' });
    const styles = {
      concise: 'Create a concise summary of the most important points.',
      detailed: 'Create a comprehensive, detailed summary covering all key concepts.',
      bullets: 'Create a well-organized bullet-point summary.',
      exam: 'Create an exam-ready summary with Key Concepts, Definitions, and Quick Review Points.'
    };
    const prompt = `You are an expert academic summarizer.
${subject ? 'Subject: ' + subject : ''}
Style: ${styles[style] || styles.concise}
Notes: """${notes}"""
Create a clear, structured summary suitable for university exam preparation.`;
    const summary = await callGemini(prompt, '', apiKey);
    res.json({ summary, subject, style });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/plan — generate study plan
router.post('/plan', auth, aiLimit, async (req, res) => {
  try {
    const { subjects, days = 5, hoursPerDay = 3, goal = 'revision', level = 'intermediate', notes: extraNotes = '', apiKey } = req.body;
    if (!subjects?.length) return res.status(400).json({ error: 'Subjects required' });
    const prompt = `Create a ${days}-day study plan for a ${level} university student.
Subjects: ${subjects.join(', ')}
Daily hours: ${hoursPerDay}
Goal: ${goal}
${extraNotes}
Return ONLY valid JSON array:
[{"day":1,"date_label":"Day 1 — Monday","total_hours":${hoursPerDay},"sessions":[{"subject":"...","topic":"...","duration_min":60,"type":"lecture","priority":"high","tips":"..."}]}]`;
    const raw = await callGemini(prompt, '', apiKey);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'Invalid plan format' });
    const plan = JSON.parse(match[0]);
    res.json({ plan, subjects, days, hoursPerDay, goal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
