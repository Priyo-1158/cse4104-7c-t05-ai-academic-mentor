import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { DataStore, Notifications } from '../services/localStore';
import { GeminiAPI, BackendAPI } from '../services/aiApi';
import { timeAgo } from '../utils/helpers';
import './Planner.css';

const COLORS = ['#3b82f6', '#06d6a0', '#f72585', '#ffd166', '#7c3aed', '#f97316'];
const TYPE_COLORS = { lecture: '#3b82f6', practice: '#06d6a0', review: '#ffd166', assignment: '#f72585' };
const TYPE_ICONS = { lecture: '📖', practice: '⚡', review: '🔄', assignment: '📝' };

export default function Planner() {
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [days, setDays] = useState('5');
  const [hoursPerDay, setHoursPerDay] = useState('3');
  const [goal, setGoal] = useState('revision');
  const [level, setLevel] = useState('intermediate');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [planData, setPlanData] = useState(null);
  const [history, setHistory] = useState(() => DataStore.get('study_plans') || []);

  function addSubject() {
    const val = subjectInput.trim();
    if (!val || subjects.includes(val)) { setSubjectInput(''); return; }
    setSubjects([...subjects, val]);
    setSubjectInput('');
  }

  function removeSubject(i) {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  }

  function loadPlan(i) {
    const plan = history[i];
    if (!plan) return;
    setPlanData(plan);
  }

  async function generatePlan() {
    if (!subjects.length) { alert('Add at least one subject.'); return; }
    setLoading(true);
    setError(null);

    const d = parseInt(days), h = parseInt(hoursPerDay);
    const prompt = `Create a ${d}-day study plan for a ${level} university CSE student.

Subjects: ${subjects.join(', ')}
Daily study time: ${h} hours
Goal: ${goal}
${notes ? 'Additional notes: ' + notes : ''}

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, no explanation):
[
  {
    "day": 1,
    "date_label": "Day 1 — Monday",
    "total_hours": ${h},
    "sessions": [
      {
        "subject": "Subject Name",
        "topic": "Specific topic to cover",
        "duration_min": 60,
        "type": "lecture|practice|review|assignment",
        "priority": "high|medium|low",
        "tips": "Brief study tip"
      }
    ]
  }
]

Distribute subjects intelligently across ${d} days. Each day should have multiple focused sessions adding up to ~${h} hours (${h * 60} minutes). Include breaks between sessions. Make topics specific and actionable.`;

    try {
      const raw = await GeminiAPI.call(prompt);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Invalid response');
      const plan = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(plan) || !plan.length) throw new Error('Empty plan');

      const newPlanData = { subjects, days: d, hoursPerDay: h, goal, level, plan, date: new Date().toISOString(), completions: {} };
      const updated = DataStore.push('study_plans', newPlanData);
      setHistory(updated);
      setPlanData(newPlanData);
      Notifications.add(`Study plan created: ${subjects.join(', ')} 📅`, 'info');

      BackendAPI.savePlan({
        title: `${subjects.join(', ')} — ${d}-day plan`,
        subjects, days: plan, goal, hoursPerDay: h, level
      }).then(res => {
        if (res.demoMode) console.warn('Plan saved in DEMO MODE — MongoDB not connected.');
        else console.log('✅ Study plan saved to MongoDB.');
      }).catch(err => console.error('Failed to save plan to backend:', err.message));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function toggleSession(dayIdx, sessIdx) {
    if (!planData) return;
    const key = `${dayIdx}-${sessIdx}`;
    const completions = { ...(planData.completions || {}) };
    completions[key] = !completions[key];
    const updatedPlanData = { ...planData, completions };
    setPlanData(updatedPlanData);

    const updatedHistory = [...history];
    if (updatedHistory[0]) {
      updatedHistory[0] = { ...updatedHistory[0], completions };
      setHistory(updatedHistory);
      DataStore.set('study_plans', updatedHistory);
    }
  }

  const totalSessions = planData ? planData.plan.reduce((a, d) => a + d.sessions.length, 0) : 0;
  const completed = planData ? Object.values(planData.completions || {}).filter(Boolean).length : 0;
  const progPct = totalSessions ? Math.round((completed / totalSessions) * 100) : 0;

  return (
    <AppLayout title="📅 Personalized Study Planner" subtitle="AI-generated study plans tailored to your schedule" bodyClassName="wide">
        <div className="planner-layout">

          <div className="gen-panel">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Create Study Plan</div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Add Subject</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" className="form-input" placeholder="e.g. Data Structures" style={{ flex: 1 }}
                    value={subjectInput} onChange={e => setSubjectInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addSubject(); }} />
                  <button className="btn-primary" onClick={addSubject} style={{ padding: '10px 14px', flexShrink: 0 }}>+</button>
                </div>
                <div className="subject-tags">
                  {subjects.map((s, i) => (
                    <div className="subject-tag" key={i}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      {s}
                      <button onClick={() => removeSubject(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="plan-meta">
                <div className="form-group">
                  <label>Study Days</label>
                  <select className="form-input" value={days} onChange={e => setDays(e.target.value)}>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Daily Hours</label>
                  <select className="form-input" value={hoursPerDay} onChange={e => setHoursPerDay(e.target.value)}>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="6">6 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Goal</label>
                  <select className="form-input" value={goal} onChange={e => setGoal(e.target.value)}>
                    <option value="exam">Exam Prep</option>
                    <option value="revision">Revision</option>
                    <option value="new">Learn New Topics</option>
                    <option value="assignment">Assignments</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select className="form-input" value={level} onChange={e => setLevel(e.target.value)}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Additional Notes (optional)</label>
                <textarea className="form-input" style={{ minHeight: 70 }} placeholder="e.g. Weak in trees and graphs, exam next Monday..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button className="btn-primary" disabled={loading} onClick={generatePlan} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Generating...</> : '📅 Generate Study Plan'}
              </button>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Saved Plans</div>
              <div>
                {!history.length ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>No plans yet</div>
                ) : history.slice(0, 4).map((p, i) => (
                  <div className="plan-history-item" key={i} onClick={() => loadPlan(i)}>
                    <strong>{p.subjects?.join(', ') || 'Study Plan'}</strong>
                    <span>{p.days} days · {p.hoursPerDay}h/day · {timeAgo(p.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {!planData && !error && (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p>Add your subjects, set your schedule, and click Generate. Gemini AI will create a personalized study plan for you.</p>
              </div>
            )}
            {error && <div className="alert alert-error">Failed to generate plan: {error}</div>}

            {planData && (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div className="card-title">📅 Your Study Plan</div>
                      <div className="card-sub">{planData.subjects?.join(' · ')} · {planData.days} days · {planData.hoursPerDay}h/day</div>
                    </div>
                    <span className="badge badge-green">{planData.goal}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="prog-bar" style={{ flex: 1 }}><div className="prog-fill green" style={{ width: `${progPct}%` }} /></div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-2)' }}>{completed}/{totalSessions} done</span>
                  </div>
                </div>

                {planData.plan.map((day, di) => (
                  <div className="day-block" style={{ animationDelay: `${di * 0.08}s` }} key={di}>
                    <div className="day-header">
                      <strong>{day.date_label || 'Day ' + day.day}</strong>
                      <span>{day.total_hours}h · {day.sessions.length} sessions</span>
                    </div>
                    <div className="day-sessions">
                      {day.sessions.map((s, si) => {
                        const isDone = (planData.completions || {})[`${di}-${si}`];
                        return (
                          <div className={`session-block${isDone ? ' done' : ''}`} key={si} onClick={() => toggleSession(di, si)}>
                            <div className="sess-check">{isDone ? '✓' : ''}</div>
                            <div className="sess-color" style={{ background: TYPE_COLORS[s.type] || '#3b82f6', minHeight: 36 }} />
                            <div className="sess-info">
                              <span className="sess-title">{TYPE_ICONS[s.type] || '📖'} {s.subject} — {s.topic}</span>
                              <span className="sess-meta">{s.type} · Priority: {s.priority} · {s.tips || ''}</span>
                            </div>
                            <span className="sess-duration">{s.duration_min}m</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
    </AppLayout>
  );
}
