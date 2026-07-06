import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { DataStore } from '../services/localStore';
import './Settings.css';

const NAV_ITEMS = [
  { id: 'profile', label: '👤 Profile' },
  { id: 'data', label: '🗂 Data Management' },
  { id: 'about', label: 'ℹ About' },
];

function counts() {
  return {
    quiz: (DataStore.get('quiz_results') || []).length,
    chat: (DataStore.get('chat_sessions') || []).length,
    plan: (DataStore.get('study_plans') || []).length,
    sum: (DataStore.get('summaries') || []).length,
  };
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState('profile');
  const [dataCounts, setDataCounts] = useState(counts);

  function clearSection(key, label) {
    if (!confirm(`Clear all ${label}?`)) return;
    DataStore.set(key, []);
    setDataCounts(counts());
  }

  function clearAllData() {
    if (!confirm('Clear ALL data? This cannot be undone.')) return;
    ['quiz_results', 'chat_history', 'study_plans', 'summaries', 'chat_sessions', 'notifications'].forEach(k => DataStore.set(k, []));
    setDataCounts(counts());
    alert('All data cleared.');
  }

  return (
    <AppLayout title="⚙ Settings" subtitle="Manage your account and preferences" bodyClassName="wide" bodyStyle={{ padding: 28, maxWidth: 1000 }}>
        <div className="settings-layout">

          <div className="settings-nav">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`sett-nav-item${section === item.id ? ' active' : ''}`} onClick={() => setSection(item.id)}>
                {item.label}
              </div>
            ))}
          </div>

          <div>
            {section === 'profile' && (
              <>
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 4 }}>Profile Settings</div>
                  <div className="card-sub" style={{ marginBottom: 20 }}>Your account information</div>
                  <div>
                    <div className="sett-row"><div className="sett-info"><strong>Name</strong><p>{user?.name || ''}</p></div></div>
                    <div className="sett-row"><div className="sett-info"><strong>Email</strong><p>{user?.email || ''}</p></div></div>
                    <div className="sett-row"><div className="sett-info"><strong>Student ID</strong><p>{user?.studentId || 'Not set'}</p></div></div>
                    <div className="sett-row"><div className="sett-info"><strong>Department</strong><p>{user?.department || user?.dept || 'Not set'}</p></div></div>
                    <div className="sett-row"><div className="sett-info"><strong>Role</strong><p>{user?.role || 'student'}</p></div></div>
                    <div className="sett-row"><div className="sett-info"><strong>Joined</strong><p>{user?.joined || user?.createdAt ? new Date(user.joined || user.createdAt).toLocaleDateString() : 'Unknown'}</p></div></div>
                    <div style={{ marginTop: 16 }}>
                      <button className="btn-outline" onClick={logout} style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)' }}>Sign Out</button>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: 20 }}>
                  <div className="card-title" style={{ marginBottom: 4 }}>AI Engine</div>
                  <div className="card-sub" style={{ marginBottom: 16 }}>How AI features are powered</div>
                  <div style={{ background: 'rgba(6,214,160,0.06)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 10, padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>🔒 Secure Server-Side AI</div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>
                      All AI features (chatbot, quiz generator, summarizer, study planner) run through the
                      secure backend server. The Gemini API key is stored only in the server environment
                      and is never exposed to the browser. You do not need to provide any API key.
                    </p>
                  </div>
                </div>
              </>
            )}

            {section === 'data' && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>Data Management</div>
                <div className="card-sub" style={{ marginBottom: 20 }}>Manage your stored data</div>

                <div className="sett-row">
                  <div className="sett-info"><strong>Quiz Results</strong><p>{dataCounts.quiz} quiz result{dataCounts.quiz !== 1 ? 's' : ''} stored</p></div>
                  <button className="btn-ghost" onClick={() => clearSection('quiz_results', 'quiz results')} style={{ color: 'var(--accent-2)', fontSize: '0.82rem' }}>Clear</button>
                </div>
                <div className="sett-row">
                  <div className="sett-info"><strong>Chat History</strong><p>{dataCounts.chat} conversation{dataCounts.chat !== 1 ? 's' : ''} stored</p></div>
                  <button className="btn-ghost" onClick={() => clearSection('chat_sessions', 'chat history')} style={{ color: 'var(--accent-2)', fontSize: '0.82rem' }}>Clear</button>
                </div>
                <div className="sett-row">
                  <div className="sett-info"><strong>Study Plans</strong><p>{dataCounts.plan} study plan{dataCounts.plan !== 1 ? 's' : ''} stored</p></div>
                  <button className="btn-ghost" onClick={() => clearSection('study_plans', 'study plans')} style={{ color: 'var(--accent-2)', fontSize: '0.82rem' }}>Clear</button>
                </div>
                <div className="sett-row">
                  <div className="sett-info"><strong>Summaries</strong><p>{dataCounts.sum} summar{dataCounts.sum !== 1 ? 'ies' : 'y'} stored</p></div>
                  <button className="btn-ghost" onClick={() => clearSection('summaries', 'summaries')} style={{ color: 'var(--accent-2)', fontSize: '0.82rem' }}>Clear</button>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button className="btn-outline" onClick={clearAllData} style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)', width: '100%', justifyContent: 'center' }}>
                    ⚠ Clear All Data
                  </button>
                </div>
              </div>
            )}

            {section === 'about' && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>About AI Academic Mentor</div>
                <div style={{ marginTop: 16 }}>
                  <table className="data-table">
                    <tbody>
                      <tr><td style={{ color: 'var(--text-3)' }}>Project</td><td>AI Academic Mentor — Personalized Learning & Study Assistant</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Team</td><td>CSE4104-7C-T05</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Section</td><td>7C</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Course</td><td>CSE 4104 — Software Development III</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Institution</td><td>Northern University of Business and Technology, Khulna</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Instructor</td><td>Md. Riaz Mahmud, Assistant Professor, CSE Dept.</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Team Leader</td><td>Shadman Sadequeen Priyo ( ID: 11230121158 )</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Frontend Dev</td><td>Musabbir Hossain Chayon ( ID: 11230121168 )</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Backend Dev</td><td>Sk. Nadirul Haque Nadir ( ID: 11230121155 )</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>AI Integration</td><td>Shafin Kabir ( ID: 11230121175 )</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>AI Engine</td><td>Google Gemini 2.5 Flash / Hugging Face Inference API</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Version</td><td>v1.0.0</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
    </AppLayout>
  );
}
