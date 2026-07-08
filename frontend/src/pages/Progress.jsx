import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { DataStore } from '../services/localStore';
import { BackendAPI } from '../services/aiApi';
import './Progress.css';

function calcStreak(quizzes) {
  if (!quizzes.length) return 0;
  const days = new Set(quizzes.map(q => new Date(q.date).toDateString()));
  let streak = 0;
  let d = new Date();
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export default function Progress() {
  const [, setTick] = useState(0); // forces re-render after backend merge

  useEffect(() => {
    // FIX: pull real quiz history from MongoDB via /api/quiz and merge it
    // into the local cache before rendering, so the numbers reflect what's
    // actually stored in the database (not just this browser's cache).
    BackendAPI.listQuizResults()
      .then(backendQuizzes => {
        if (backendQuizzes?.results?.length) {
          const mapped = backendQuizzes.results.map(r => ({
            topic: r.topic, score: r.score, numQ: r.numQuestions, correct: r.correct, date: r.createdAt
          }));
          DataStore.set('quiz_results', mapped);
          setTick(t => t + 1);
        }
      })
      .catch(err => console.warn('Could not load live quiz history from backend, using local cache:', err.message));
  }, []);

  const quizzes = DataStore.get('quiz_results') || [];
  const chats = DataStore.get('chat_history') || [];
  const plans = DataStore.get('study_plans') || [];
  const summaries = DataStore.get('summaries') || [];

  const totalQ = quizzes.length;
  const avgScore = totalQ ? Math.round(quizzes.reduce((a, q) => a + (q.score || 0), 0) / totalQ) : 0;
  const bestScore = totalQ ? Math.max(...quizzes.map(q => q.score || 0)) : 0;
  const streak = calcStreak(quizzes);

  const scoreChartData = [...quizzes].reverse().slice(0, 10);

  const topics = {};
  quizzes.forEach(q => {
    if (!topics[q.topic]) topics[q.topic] = { scores: [], count: 0 };
    topics[q.topic].scores.push(q.score || 0);
    topics[q.topic].count++;
  });
  const topicRows = Object.entries(topics).map(([t, d]) => ({
    topic: t,
    avg: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    count: d.count
  })).sort((a, b) => b.avg - a.avg).slice(0, 8);

  const features = [
    { name: 'AI Chatbot', icon: '🤖', count: chats.length, color: 'var(--primary)' },
    { name: 'Quiz Generator', icon: '⚡', count: quizzes.length, color: 'var(--gold)' },
    { name: 'Note Summarizer', icon: '📝', count: summaries.length, color: 'var(--accent)' },
    { name: 'Study Planner', icon: '📅', count: plans.length, color: 'var(--accent-2)' },
  ];
  const maxCount = Math.max(...features.map(f => f.count), 1);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekCounts = new Array(7).fill(0);
  const allActivity = [
    ...quizzes.map(q => new Date(q.date)),
    ...chats.map(c => new Date(c.date)),
    ...summaries.map(s => new Date(s.date)),
  ];
  allActivity.forEach(d => { weekCounts[(d.getDay() + 6) % 7]++; });
  const weekMax = Math.max(...weekCounts, 1);

  const quizTableRows = [...quizzes].reverse();

  function clearAllData() {
    if (!confirm('Clear ALL your progress data? This cannot be undone.')) return;
    ['quiz_results', 'chat_history', 'study_plans', 'summaries', 'chat_sessions', 'notifications'].forEach(k => DataStore.set(k, []));
    window.location.reload();
  }

  return (
    <AppLayout
      title="📊 Progress Analytics"
      subtitle="Track your performance and identify weak areas"
      bodyClassName="wide"
      bodyStyle={{ padding: 28, maxWidth: 1100 }}
      actions={<button className="btn-ghost" onClick={clearAllData} style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Reset Data</button>}
    >
        <div className="stats-row stagger">
          <div className="stat-card fade-up"><div className="stat-icon">⚡</div><div className="stat-number">{totalQ}</div><div className="stat-label">Total Quizzes</div></div>
          <div className="stat-card fade-up"><div className="stat-icon">🎯</div><div className="stat-number">{avgScore}%</div><div className="stat-label">Average Score</div><div className="stat-change">{avgScore >= 70 ? '✓ Strong performance' : avgScore > 0 ? 'Keep practicing' : 'No data yet'}</div></div>
          <div className="stat-card fade-up"><div className="stat-icon">🏆</div><div className="stat-number">{bestScore}%</div><div className="stat-label">Best Score</div></div>
          <div className="stat-card fade-up"><div className="stat-icon">🔥</div><div className="stat-number">{streak}</div><div className="stat-label">Day Streak</div><div className="stat-change">{streak > 0 ? 'Keep it up!' : 'Study today!'}</div></div>
        </div>

        <div className="prog-grid">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Quiz Scores Over Time</div>
            <div className="chart-wrap">
              {!scoreChartData.length ? (
                <div className="no-data">Take quizzes to see your score trend</div>
              ) : (
                <div className="bar-chart">
                  {scoreChartData.map((q, i) => {
                    const h = Math.max(8, q.score * 1.5);
                    const col = q.score >= 70 ? 'var(--accent)' : q.score >= 50 ? 'var(--gold)' : 'var(--accent-2)';
                    return (
                      <div className="bar-col" key={i}>
                        <div className="bar" style={{ height: h, background: col }} data-val={`${q.score}%`} />
                        <span className="bar-label">Q{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 8, fontFamily: 'var(--mono)' }}>Last 10 quizzes</div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Topic Performance</div>
            <div>
              {!quizzes.length ? <div className="no-data">No quiz data yet</div> : topicRows.map((t, i) => (
                <div className="topic-row" key={i}>
                  <div className="topic-name">{t.topic.length > 30 ? t.topic.slice(0, 30) + '...' : t.topic}</div>
                  <div className="topic-prog-wrap">
                    <div className="prog-bar"><div className={`prog-fill ${t.avg >= 70 ? 'green' : t.avg >= 50 ? 'gold' : 'blue'}`} style={{ width: `${t.avg}%` }} /></div>
                  </div>
                  <div className="topic-score" style={{ color: t.avg >= 70 ? 'var(--accent)' : t.avg >= 50 ? 'var(--gold)' : 'var(--accent-2)' }}>{t.avg}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="prog-grid">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>AI Feature Usage</div>
            <div>
              {features.map((f, i) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }} key={i}>
                  <span style={{ fontSize: '1.1rem', width: 24 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>{f.name}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--text-3)' }}>{f.count} uses</span>
                    </div>
                    <div className="prog-bar"><div className="prog-fill" style={{ width: `${Math.round((f.count / maxCount) * 100)}%`, background: f.color }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Weekly Activity</div>
            <div className="chart-wrap">
              <div className="bar-chart">
                {days.map((d, i) => {
                  const h = Math.max(4, (weekCounts[i] / weekMax) * 140);
                  return (
                    <div className="bar-col" key={i}>
                      <div className="bar" style={{ height: h, background: 'var(--primary)', opacity: weekCounts[i] ? 1 : 0.2 }} data-val={`${weekCounts[i]} actions`} />
                      <span className="bar-label">{d}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Quiz History</div>
          <div className="quiz-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Topic</th><th>Score</th><th>Questions</th><th>Correct</th><th>Date</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {!quizTableRows.length ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 30 }}>No quiz data yet. Generate a quiz to track progress!</td></tr>
                ) : quizTableRows.map((q, i) => {
                  const grade = q.score >= 90 ? 'A+' : q.score >= 80 ? 'A' : q.score >= 70 ? 'B' : q.score >= 60 ? 'C' : q.score >= 50 ? 'D' : 'F';
                  const gradeColor = q.score >= 70 ? 'var(--accent)' : q.score >= 50 ? 'var(--gold)' : 'var(--accent-2)';
                  return (
                    <tr key={i}>
                      <td>{q.topic}</td>
                      <td style={{ color: gradeColor, fontWeight: 700 }}>{q.score}%</td>
                      <td>{q.numQ}</td>
                      <td>{q.correct || Math.round((q.score / 100) * q.numQ)}</td>
                      <td style={{ color: 'var(--text-3)' }}>{new Date(q.date).toLocaleDateString()}</td>
                      <td><span className={`badge ${q.score >= 70 ? 'badge-green' : q.score >= 50 ? 'badge-gold' : 'badge-blue'}`}>{grade}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    </AppLayout>
  );
}
