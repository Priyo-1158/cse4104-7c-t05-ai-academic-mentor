import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { AdminAPI } from '../services/aiApi';
import { initials as getInitials, timeAgo } from '../utils/helpers';
import './Admin.css';

const ANNOUNCE_KEY = 'aim_announcements';
function getAnnouncements() {
  try { return JSON.parse(localStorage.getItem(ANNOUNCE_KEY) || '[]'); } catch { return []; }
}

const PRIORITY_BADGE = { info: 'badge-blue', warning: 'badge-gold', urgent: 'badge' };
const PRIORITY_ICON = { info: 'ℹ', warning: '⚠', urgent: '🚨' };

export default function Admin() {
  const { user: adminUser } = useAuth();
  const [tab, setTab] = useState('users');
  const [toasts, setToasts] = useState([]);

  function showToast(msg, type = 'ok') {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }

  // ── Stats ──
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  async function loadStats() {
    try {
      const { stats } = await AdminAPI.stats();
      setStats(stats);
      setStatsError(null);
    } catch (err) {
      setStatsError(err.message);
    }
  }

  // ── Users ──
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function loadUsers() {
    try {
      const data = await AdminAPI.listUsers('?limit=200');
      setUsers(data.users || []);
      setUsersLoaded(true);
      setUsersError(null);
    } catch (err) {
      setUsersError(err.message);
      setUsersLoaded(true);
    }
  }

  useEffect(() => { loadStats(); loadUsers(); }, []);

  let filteredUsers = users;
  if (filter === 'student') filteredUsers = filteredUsers.filter(u => u.role !== 'admin' && u.isActive);
  else if (filter === 'admin') filteredUsers = filteredUsers.filter(u => u.role === 'admin');
  else if (filter === 'banned') filteredUsers = filteredUsers.filter(u => !u.isActive);
  if (search) {
    const q = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }

  async function promoteUser(u) {
    if (!confirm(`Promote "${u.name}" to Admin? They will have full platform control.`)) return;
    try {
      await AdminAPI.updateUser(u._id, { role: 'admin' });
      setUsers(us => us.map(x => x._id === u._id ? { ...x, role: 'admin' } : x));
      showToast(`${u.name} promoted to Admin`);
      loadStats();
    } catch (err) { showToast('Failed: ' + err.message, 'warn'); }
  }
  async function demoteUser(u) {
    if (!confirm(`Demote "${u.name}" to Student?`)) return;
    try {
      await AdminAPI.updateUser(u._id, { role: 'student' });
      setUsers(us => us.map(x => x._id === u._id ? { ...x, role: 'student' } : x));
      showToast(`${u.name} demoted to Student`);
      loadStats();
    } catch (err) { showToast('Failed: ' + err.message, 'warn'); }
  }
  async function banUser(u) {
    if (!confirm(`Disable "${u.name}"? They will be unable to log in.`)) return;
    try {
      await AdminAPI.updateUser(u._id, { isActive: false });
      setUsers(us => us.map(x => x._id === u._id ? { ...x, isActive: false } : x));
      showToast(`${u.name} has been disabled`, 'warn');
      loadStats();
    } catch (err) { showToast('Failed: ' + err.message, 'warn'); }
  }
  async function unbanUser(u) {
    try {
      await AdminAPI.updateUser(u._id, { isActive: true });
      setUsers(us => us.map(x => x._id === u._id ? { ...x, isActive: true } : x));
      showToast(`${u.name} has been enabled`);
      loadStats();
    } catch (err) { showToast('Failed: ' + err.message, 'warn'); }
  }
  async function deleteUser(u) {
    if (!confirm(`Permanently delete "${u.name}"? This also removes ALL their quizzes, plans and notes in MongoDB and cannot be undone.`)) return;
    try {
      await AdminAPI.deleteUser(u._id);
      setUsers(us => us.filter(x => x._id !== u._id));
      showToast(`${u.name} deleted permanently`, 'warn');
      loadStats();
      closeModal();
    } catch (err) { showToast('Failed: ' + err.message, 'warn'); }
  }

  // ── User detail modal ──
  const [modalUser, setModalUser] = useState(null);
  const [modalActivity, setModalActivity] = useState(null);
  async function viewUserDetail(u) {
    setModalUser(u);
    setModalActivity(null);
    try {
      const activity = await AdminAPI.getUserActivity(u._id);
      setModalActivity(activity);
    } catch (err) {
      console.warn('Could not load user activity:', err.message);
      setModalActivity({ quizzes: 0, plans: 0, chats: 0, avgScore: 0 });
    }
  }
  function closeModal() { setModalUser(null); setModalActivity(null); }

  // ── Data tab ──
  const [dataRows, setDataRows] = useState(null);
  async function renderDataTab() {
    setDataRows(null);
    const rows = await Promise.all(users.map(async u => {
      let a = { quizzes: 0, chats: 0, plans: 0, notes: 0 };
      try { a = await AdminAPI.getUserActivity(u._id); } catch { /* ignore */ }
      return { u, a };
    }));
    setDataRows(rows);
  }

  function exportAllData() {
    const dump = users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, studentId: u.studentId, createdAt: u.createdAt }));
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai-mentor-users-export-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    showToast('User list exported');
  }

  function nukeAllData() {
    alert("Full platform wipe is not available from the UI on purpose — this would delete every real user's MongoDB data. If you actually need this, do it directly in MongoDB Atlas, deliberately, outside the app.");
  }

  function resetAllNotifications() {
    showToast('Notifications are stored per-browser locally — nothing to reset server-side.', 'warn');
  }

  // ── Announcements (local-only — no Mongo model for this exists) ──
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [announcePriority, setAnnouncePriority] = useState('info');
  const [announcements, setAnnouncements] = useState(getAnnouncements);

  function postAnnouncement() {
    if (!announceTitle.trim() || !announceMsg.trim()) { alert('Fill in both title and message.'); return; }
    const anns = getAnnouncements();
    anns.unshift({ title: announceTitle.trim(), message: announceMsg.trim(), priority: announcePriority, author: adminUser.name, date: new Date().toISOString() });
    localStorage.setItem(ANNOUNCE_KEY, JSON.stringify(anns));
    setAnnounceTitle(''); setAnnounceMsg('');
    setAnnouncements(anns);
    showToast('Saved locally — this is NOT broadcast to student accounts yet.', 'warn');
  }
  function deleteAnnouncement(idx) {
    const anns = getAnnouncements();
    anns.splice(idx, 1);
    localStorage.setItem(ANNOUNCE_KEY, JSON.stringify(anns));
    setAnnouncements(anns);
  }

  function handleTab(id) {
    setTab(id);
    if (id === 'data') renderDataTab();
  }

  return (
    <AppLayout
      title="🛡 Admin Panel"
      subtitle="Full platform control"
      bodyClassName="wide"
      bodyStyle={{ padding: 28, maxWidth: 1200 }}
      actions={<span className="badge badge-gold">Admin Access</span>}
    >
        <div className="admin-grid stagger">
          {statsError ? (
            <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>Could not load stats: {statsError}</div>
          ) : !stats ? (
            <div style={{ gridColumn: '1/-1', color: 'var(--text-3)' }}>Loading stats…</div>
          ) : (
            <>
              <div className="stat-card fade-up"><div className="stat-icon">👥</div><div className="stat-number">{stats.totalUsers}</div><div className="stat-label">Total Users</div></div>
              <div className="stat-card fade-up"><div className="stat-icon">🎓</div><div className="stat-number">{stats.totalUsers}</div><div className="stat-label">Registered Accounts</div></div>
              <div className="stat-card fade-up"><div className="stat-icon">⚡</div><div className="stat-number">{stats.totalQuizzes}</div><div className="stat-label">Total Quizzes</div></div>
              <div className="stat-card fade-up"><div className="stat-icon">📊</div><div className="stat-number">{stats.avgQuizScore}%</div><div className="stat-label">Platform Avg Score</div></div>
            </>
          )}
        </div>

        <div className="tab-bar">
          <button className={`tab-btn${tab === 'users' ? ' active' : ''}`} onClick={() => handleTab('users')}>👥 User Management</button>
          <button className={`tab-btn${tab === 'data' ? ' active' : ''}`} onClick={() => handleTab('data')}>📊 Platform Data</button>
          <button className={`tab-btn${tab === 'announce' ? ' active' : ''}`} onClick={() => handleTab('announce')}>📢 Announcements</button>
          <button className={`tab-btn${tab === 'system' ? ' active' : ''}`} onClick={() => handleTab('system')}>⚙ System</button>
        </div>

        {tab === 'users' && (
          <div className="tab-panel active">
            <div className="search-bar">
              <input type="text" className="form-input" placeholder="Search by name or email…" style={{ maxWidth: 340 }}
                value={search} onChange={e => setSearch(e.target.value)} />
              <div className="filter-btns">
                {['all', 'student', 'admin', 'banned'].map(f => (
                  <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                    {f === 'all' ? 'All' : f === 'student' ? 'Students' : f === 'admin' ? 'Admins' : 'Banned'}
                  </button>
                ))}
              </div>
            </div>
            <div className="users-grid">
              {!usersLoaded ? (
                <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '20px 0', gridColumn: '1/-1' }}>Loading users…</div>
              ) : usersError ? (
                <div className="alert alert-error" style={{ gridColumn: '1/-1' }}>Could not load users: {usersError}</div>
              ) : !filteredUsers.length ? (
                <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '20px 0', gridColumn: '1/-1' }}>No users match this filter.</div>
              ) : filteredUsers.map(u => {
                const isAdmin = u.role === 'admin';
                const isBanned = !u.isActive;
                const isSelf = u._id === adminUser.id || u._id === adminUser._id;
                const avatarClass = isAdmin ? 'admin-av' : isBanned ? 'banned-av' : '';
                return (
                  <div className="user-card" key={u._id}>
                    <div className="user-card-top">
                      <div className={`user-card-avatar ${avatarClass}`}>{getInitials(u.name)}</div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</strong>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <span className={`badge ${isAdmin ? 'badge-gold' : 'badge-blue'}`}>{isAdmin ? '🛡 Admin' : '🎓 Student'}</span>
                          {isBanned && <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>🚫 Disabled</span>}
                          {isSelf && <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>You</span>}
                        </div>
                      </div>
                    </div>
                    <div className="user-card-meta">
                      <div>✉ {u.email}</div>
                      {u.studentId && <div>🎓 ID: {u.studentId}</div>}
                      {u.department && <div>🏛 {u.department}</div>}
                      <div>📅 Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                    {!isSelf ? (
                      <div className="user-card-actions">
                        <button className="btn-xs" onClick={() => viewUserDetail(u)} style={{ background: 'rgba(59,130,246,0.08)', color: 'var(--primary-light)', borderColor: 'rgba(59,130,246,0.25)' }}>👁 View</button>
                        {!isAdmin
                          ? <button className="btn-xs btn-xs-promote" onClick={() => promoteUser(u)}>⬆ Make Admin</button>
                          : <button className="btn-xs btn-xs-demote" onClick={() => demoteUser(u)}>⬇ Demote</button>}
                        {!isBanned
                          ? <button className="btn-xs btn-xs-ban" onClick={() => banUser(u)}>🚫 Disable</button>
                          : <button className="btn-xs btn-xs-unban" onClick={() => unbanUser(u)}>✅ Enable</button>}
                        <button className="btn-xs btn-xs-delete" onClick={() => deleteUser(u)}>🗑 Delete</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 10, fontStyle: 'italic' }}>Cannot modify your own account</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'data' && (
          <div className="tab-panel active">
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Per-User Data Overview</div>
              <div>
                {!dataRows ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Loading…</div>
                ) : !dataRows.length ? (
                  <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No users registered.</div>
                ) : dataRows.map(({ u, a }) => (
                  <div className="user-data-row" key={u._id}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: 8 }}>{u.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-2)' }}>
                      <span>⚡ {a.quizzes || 0}</span><span>🤖 {a.chats || 0}</span><span>📅 {a.plans || 0}</span><span>📄 {a.notes || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Bulk Data Operations</div>
              <div className="card-sub" style={{ marginBottom: 16 }}>These actions affect all users. Use with caution.</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-outline" onClick={exportAllData} style={{ fontSize: '0.85rem' }}>📥 Export User List (JSON)</button>
                <button className="btn-outline" onClick={nukeAllData} style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)', fontSize: '0.85rem' }}>⚠️ Bulk Clear (see note)</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'announce' && (
          <div className="tab-panel active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>Post Announcement</div>
                <div className="card-sub" style={{ marginBottom: 16 }}>Visible to all students on their notifications page</div>
                <div className="announce-form">
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Week 5 Submission Reminder" value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea className="form-input" style={{ minHeight: 120 }} placeholder="Write your announcement…" value={announceMsg} onChange={e => setAnnounceMsg(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-input" value={announcePriority} onChange={e => setAnnouncePriority(e.target.value)}>
                      <option value="info">ℹ Info</option>
                      <option value="warning">⚠ Warning</option>
                      <option value="urgent">🚨 Urgent</option>
                    </select>
                  </div>
                  <button className="btn-primary" onClick={postAnnouncement}>Post Announcement</button>
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Posted Announcements</div>
                <div>
                  {!announcements.length ? (
                    <div style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>No announcements yet.</div>
                  ) : announcements.map((a, i) => (
                    <div className="announcement-item" key={i}>
                      <button className="ann-del" onClick={() => deleteAnnouncement(i)}>✕</button>
                      <strong>{a.title} <span className={`badge ${PRIORITY_BADGE[a.priority] || 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>{PRIORITY_ICON[a.priority] || 'ℹ'} {a.priority || 'info'}</span></strong>
                      <p>{a.message}</p>
                      <span>By {a.author} · {timeAgo(a.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="tab-panel active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>System Information</div>
                <table className="data-table">
                  <tbody>
                    <tr><td style={{ color: 'var(--text-3)' }}>Total Users (MongoDB)</td><td>{users.length}</td></tr>
                    <tr><td style={{ color: 'var(--text-3)' }}>Admins</td><td>{users.filter(u => u.role === 'admin').length}</td></tr>
                    <tr><td style={{ color: 'var(--text-3)' }}>Disabled Accounts</td><td>{users.filter(u => !u.isActive).length}</td></tr>
                    <tr><td style={{ color: 'var(--text-3)' }}>Announcements (local only)</td><td>{announcements.length}</td></tr>
                    <tr><td style={{ color: 'var(--text-3)' }}>App Version</td><td>1.0.0 — CSE4104-7C-T05</td></tr>
                    <tr><td style={{ color: 'var(--text-3)' }}>Logged in as</td><td>{adminUser.name}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 8 }}>Admin Actions</div>
                <div className="card-sub" style={{ marginBottom: 16 }}>Destructive operations — irreversible.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button className="btn-outline" onClick={resetAllNotifications} style={{ justifyContent: 'flex-start', fontSize: '0.85rem' }}>🔔 Clear All Notifications</button>
                  <button className="btn-outline" onClick={nukeAllData} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)', justifyContent: 'flex-start', fontSize: '0.85rem' }}>☠ Wipe All Platform Data</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {modalUser && (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <div className="modal-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{getInitials(modalUser.name)}</div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{modalUser.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>{modalUser.email}</div>
                </div>
              </div>
              {!modalActivity ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)' }}>Loading activity…</div>
              ) : (
                <>
                  <table className="data-table" style={{ marginBottom: 16 }}>
                    <tbody>
                      <tr><td style={{ color: 'var(--text-3)' }}>Role</td><td><span className={`badge ${modalUser.role === 'admin' ? 'badge-gold' : 'badge-blue'}`}>{modalUser.role}</span></td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Student ID</td><td>{modalUser.studentId || '—'}</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Department</td><td>{modalUser.department || 'CSE'}</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Status</td><td>{!modalUser.isActive ? <span style={{ color: '#f87171' }}>🚫 Disabled</span> : <span style={{ color: '#34d399' }}>✅ Active</span>}</td></tr>
                      <tr><td style={{ color: 'var(--text-3)' }}>Joined</td><td>{modalUser.createdAt ? new Date(modalUser.createdAt).toLocaleString() : 'Unknown'}</td></tr>
                    </tbody>
                  </table>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    <div className="stat-card" style={{ padding: 14 }}><div className="stat-number" style={{ fontSize: '1.4rem' }}>{modalActivity.quizzes || 0}</div><div className="stat-label">Quizzes</div></div>
                    <div className="stat-card" style={{ padding: 14 }}><div className="stat-number" style={{ fontSize: '1.4rem' }}>{modalActivity.avgScore || 0}%</div><div className="stat-label">Avg Score</div></div>
                    <div className="stat-card" style={{ padding: 14 }}><div className="stat-number" style={{ fontSize: '1.4rem' }}>{modalActivity.chats || 0}</div><div className="stat-label">Chats</div></div>
                    <div className="stat-card" style={{ padding: 14 }}><div className="stat-number" style={{ fontSize: '1.4rem' }}>{modalActivity.plans || 0}</div><div className="stat-label">Study Plans</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn-outline" onClick={closeModal} style={{ flex: 1, justifyContent: 'center' }}>Close</button>
                    {modalUser._id !== adminUser.id && (
                      <button className="btn-xs btn-xs-delete" style={{ padding: '10px 16px', fontSize: '0.82rem' }} onClick={() => deleteUser(modalUser)}>🗑 Delete User</button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map(t => (
            <div key={t.id} style={{ padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: t.type === 'warn' ? '#b91c1c' : '#065f46', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              {t.msg}
            </div>
          ))}
        </div>
    </AppLayout>
  );
}
