import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { DataStore } from '../services/localStore';
import { BackendAPI } from '../services/aiApi';
import { timeAgo } from '../utils/helpers';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const emoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quizzes = DataStore.get('quiz_results') || [];
  const chats = DataStore.get('chat_history') || [];
  const plans = DataStore.get('study_plans') || [];
  const avgScoreInitial = quizzes.length
    ? Math.round(quizzes.reduce((a, q) => a + (q.score || 0), 0) / quizzes.length)
    : 0;
  const quizzesThisWeek = quizzes.filter(q => {
    const d = new Date(q.date);
    const now = new Date();
    return d > new Date(now - 7 * 24 * 60 * 60 * 1000);
  }).length;

  const [stats, setStats] = useState({
    quizCount: quizzes.length,
    chatCount: chats.length,
    planCount: plans.length,
    avgScore: avgScoreInitial
  });

  const activities = [
    ...quizzes.slice(0, 3).map(q => ({ type: 'quiz', icon: '⚡', label: `Quiz: ${q.topic}`, detail: `Score ${q.score}%`, time: q.date })),
    ...chats.slice(0, 3).map(c => ({ type: 'ai', icon: '🤖', label: `Asked: ${c.topic}`, detail: 'AI Chatbot', time: c.date })),
    ...plans.slice(0, 2).map(p => ({ type: 'plan', icon: '📅', label: 'Study Plan Created', detail: p.subjects?.join(', '), time: p.date }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  useEffect(() => {
    // FIX: overwrite the instant local-cache numbers with real data from
    // MongoDB via /api/progress once it arrives — this was previously
    // never called by the frontend even though the endpoint existed.
    BackendAPI.getProgress()
      .then(data => {
        setStats(s => ({
          ...s,
          quizCount: data.quiz.total,
          planCount: data.plans.total,
          avgScore: data.quiz.avgScore
        }));
      })
      .catch(err => console.warn('Could not load live progress from backend:', err.message));
  }, []);

  return (
    <div className="dashboard-page">
      <AppLayout title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
        <div className="welcome-card fade-in">
          <span className="wc-emoji">{emoji}</span>
          <div>
            <h2>{greeting}, {user.name.split(' ')[0]}!</h2>
            <p>Ready to study smarter today? Your AI mentor is ready to help.</p>
          </div>
        </div>

        <div className="stats-grid stagger">
          <div className="stat-card fade-up">
            <div className="stat-icon">⚡</div>
            <div className="stat-number">{stats.quizCount}</div>
            <div className="stat-label">Quizzes Taken</div>
            <div className="stat-change">+{quizzesThisWeek} this week</div>
          </div>
          <div className="stat-card fade-up">
            <div className="stat-icon">🤖</div>
            <div className="stat-number">{stats.chatCount}</div>
            <div className="stat-label">AI Conversations</div>
            <div className="stat-change">Powered by Gemini</div>
          </div>
          <div className="stat-card fade-up">
            <div className="stat-icon">📅</div>
            <div className="stat-number">{stats.planCount}</div>
            <div className="stat-label">Study Plans</div>
            <div className="stat-change">Created this semester</div>
          </div>
          <div className="stat-card fade-up">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">{stats.avgScore}%</div>
            <div className="stat-label">Avg Quiz Score</div>
            <div className="stat-change">{stats.avgScore >= 70 ? '✓ Great performance' : quizzes.length ? 'Keep practicing' : 'Take a quiz!'}</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="card">
            <div className="card-title">Quick Actions</div>
            <div className="card-sub" style={{ marginBottom: 16 }}>Jump into a feature</div>
            <div className="quick-grid">
              <a href="/chatbot" className="quick-btn">
                <span className="qb-icon">🤖</span>
                <div><span>AI Chatbot</span><span className="qb-desc">Ask any question</span></div>
              </a>
              <a href="/quiz" className="quick-btn">
                <span className="qb-icon">⚡</span>
                <div><span>Quiz Generator</span><span className="qb-desc">Test your knowledge</span></div>
              </a>
              <a href="/summarizer" className="quick-btn">
                <span className="qb-icon">📝</span>
                <div><span>Summarizer</span><span className="qb-desc">Compress notes</span></div>
              </a>
              <a href="/planner" className="quick-btn">
                <span className="qb-icon">📅</span>
                <div><span>Study Planner</span><span className="qb-desc">Plan your week</span></div>
              </a>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Recent Activity</div>
            <div className="card-sub" style={{ marginBottom: 16 }}>Your last actions</div>
            <div>
              {activities.length ? activities.map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-icon ${a.type}`}>{a.icon}</div>
                  <div className="activity-content">
                    <strong>{a.label}</strong>
                    <span>{a.detail || ''} · {timeAgo(a.time)}</span>
                  </div>
                </div>
              )) : (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-icon">📭</div>
                  <p>No activity yet. Start using the AI features!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}
