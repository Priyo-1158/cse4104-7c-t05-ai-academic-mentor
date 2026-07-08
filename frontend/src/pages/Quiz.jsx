import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { DataStore, Notifications } from '../services/localStore';
import { GeminiAPI, BackendAPI } from '../services/aiApi';
import { timeAgo } from '../utils/helpers';
import './Quiz.css';

export default function Quiz() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [quizType, setQuizType] = useState('mcq');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [quiz, setQuiz] = useState(null); // { topic, questions: [] }
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null); // { correct, pct }

  const [history, setHistory] = useState(() => DataStore.get('quiz_results') || []);

  async function generateQuiz() {
    if (!topic.trim()) { alert('Please enter a topic.'); return; }
    setLoading(true);
    setError(null);
    setQuiz(null);
    setSubmitted(false);
    setResult(null);

    const typeDesc = quizType === 'mcq' ? 'multiple choice with 4 options (A,B,C,D)' : quizType === 'truefalse' ? 'True/False' : 'mixed multiple choice and True/False';
    const prompt = `Create a ${difficulty} ${numQuestions}-question quiz about "${topic}" for a university CSE student.

Format: Return ONLY a valid JSON array. No explanation, no markdown, no code blocks.

Example format:
[
  {
    "question": "What is...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "A",
    "explanation": "..."
  }
]

For True/False questions, options should be ["A. True", "B. False"] and answer "A" or "B".

Generate ${numQuestions} ${typeDesc} questions about: ${topic}
Difficulty: ${difficulty}. Make them appropriate for university level.`;

    try {
      const raw = await GeminiAPI.call(prompt);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response format');
      const questions = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(questions) || !questions.length) throw new Error('No questions generated');
      setQuiz({ topic, questions });
      setAnswers(new Array(questions.length).fill(null));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function selectAnswer(qi, key) {
    if (submitted) return;
    const updated = [...answers];
    updated[qi] = key;
    setAnswers(updated);
  }

  function submitQuiz() {
    let correct = 0;
    quiz.questions.forEach((q, qi) => {
      if (answers[qi] === q.answer) correct++;
    });
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setSubmitted(true);
    setResult({ correct, pct });

    const entry = { topic: quiz.topic, score: pct, numQ: quiz.questions.length, correct, date: new Date().toISOString() };
    const updatedHistory = DataStore.push('quiz_results', entry);
    setHistory(updatedHistory);
    Notifications.add(`Quiz complete: ${quiz.topic} — ${pct}% 🎯`, 'success');

    BackendAPI.saveQuizResult({
      topic: quiz.topic, score: pct, numQuestions: quiz.questions.length, correct,
      difficulty, type: quizType
    }).then(res => {
      if (res.demoMode) console.warn('Quiz saved in DEMO MODE — MongoDB not connected, this result will not persist.');
      else console.log('✅ Quiz result saved to MongoDB.');
    }).catch(err => console.error('Failed to save quiz result to backend:', err.message));
  }

  const answered = answers.filter(a => a !== null).length;
  const resultCls = result ? (result.pct >= 70 ? 'great' : result.pct >= 50 ? 'ok' : 'poor') : '';
  const resultEmoji = result ? (result.pct >= 70 ? '🎯' : result.pct >= 50 ? '📚' : '💪') : '';

  return (
    <AppLayout title="⚡ AI Quiz Generator" subtitle="Generate personalized quizzes on any topic" bodyClassName="wide" bodyStyle={{ padding: 28, maxWidth: 1100 }}>
        <div className="quiz-layout">

          <div className="gen-panel">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Generate Quiz</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Topic / Subject</label>
                  <input type="text" className="form-input" placeholder="e.g. Data Structures, OOP..." value={topic} onChange={e => setTopic(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Number of Questions</label>
                  <select className="form-input" value={numQuestions} onChange={e => setNumQuestions(e.target.value)}>
                    <option value="3">3 questions</option>
                    <option value="5">5 questions</option>
                    <option value="10">10 questions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select className="form-input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quiz Type</label>
                  <select className="form-input" value={quizType} onChange={e => setQuizType(e.target.value)}>
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="truefalse">True / False</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <button className="btn-primary" disabled={loading} onClick={generateQuiz} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? <><span className="spinner" /> Generating...</> : '⚡ Generate Quiz'}
                </button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Quiz History</div>
              <div>
                {!history.length ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>No quizzes yet</div>
                ) : history.slice(0, 5).map((r, i) => (
                  <div className="history-item" key={i}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.topic}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{r.numQ} Qs · {timeAgo(r.date)}</span>
                    </div>
                    <span className={`badge ${r.score >= 70 ? 'badge-green' : r.score >= 50 ? 'badge-gold' : 'badge-blue'}`}>{r.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {!quiz && !error && (
              <div className="empty-state">
                <div className="empty-icon">⚡</div>
                <p>Configure your quiz settings and click Generate. Gemini AI will create a personalized quiz for you instantly.</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error">Failed to generate quiz: {error}<br />Try again or check your API key.</div>
            )}

            {quiz && (
              <div className="card">
                <div className="quiz-header">
                  <div>
                    <div className="card-title">{quiz.topic}</div>
                    <div className="card-sub">{quiz.questions.length} questions · Answer all before submitting</div>
                  </div>
                  <div className="quiz-prog">
                    <div className="prog-bar" style={{ width: 120 }}><div className="prog-fill blue" style={{ width: `${(answered / quiz.questions.length) * 100}%` }} /></div>
                    <span className="quiz-prog-text">{answered}/{quiz.questions.length}</span>
                  </div>
                </div>

                <div>
                  {quiz.questions.map((q, qi) => {
                    const opts = q.options || ['A. True', 'B. False'];
                    return (
                      <div className="quiz-question" style={{ marginBottom: 28 }} key={qi}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: 8, fontFamily: 'var(--mono)' }}>Q{qi + 1} of {quiz.questions.length}</div>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14, lineHeight: 1.5 }}>{q.question}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {opts.map((opt, oi) => {
                            const key = opt[0];
                            const selected = answers[qi] === key;
                            let cls = 'quiz-option';
                            if (selected && !submitted) cls += ' selected';
                            if (submitted) {
                              if (key === q.answer) cls += ' correct';
                              else if (selected && key !== q.answer) cls += ' wrong';
                            }
                            return (
                              <button
                                key={oi}
                                className={cls}
                                style={submitted ? { pointerEvents: 'none' } : undefined}
                                onClick={() => selectAnswer(qi, key)}
                              >
                                <span className="quiz-option-key">{key}</span>
                                {opt.slice(3).trim() || opt}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && (
                          <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-2)' }}>
                            💡 <strong>Explanation:</strong> {q.explanation || 'The correct answer is ' + q.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!submitted && answered === quiz.questions.length && (
                  <div style={{ marginTop: 24 }}>
                    <button className="btn-primary" onClick={submitQuiz} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                      Submit Quiz →
                    </button>
                  </div>
                )}

                {submitted && result && (
                  <div style={{ textAlign: 'center', padding: 28, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', marginTop: 16 }}>
                    <div style={{ fontSize: '3rem' }}>{resultEmoji}</div>
                    <div className={`result-score ${resultCls}`}>{result.pct}%</div>
                    <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>
                      {result.correct} out of {quiz.questions.length} correct · {result.pct >= 70 ? 'Excellent work!' : result.pct >= 50 ? 'Good effort, keep studying!' : 'Review this topic and try again.'}
                    </p>
                    <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginRight: 10 }}>New Quiz</button>
                    <button className="btn-outline" onClick={() => navigate('/progress')}>View Progress</button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
    </AppLayout>
  );
}
