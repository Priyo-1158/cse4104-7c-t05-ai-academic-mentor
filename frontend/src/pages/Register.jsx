import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Notifications } from '../services/localStore';
import './Register.css';

export default function Register() {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', studentId: '', dept: 'CSE',
    password: '', confirm: '', wantsAdmin: false, adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    const { name, email, studentId, dept, password, confirm, wantsAdmin, adminCode } = form;

    if (password !== confirm) { setAlert({ msg: 'Passwords do not match.', type: 'error' }); return; }
    if (password.length < 6) { setAlert({ msg: 'Password must be at least 6 characters.', type: 'error' }); return; }
    if (wantsAdmin && !adminCode) { setAlert({ msg: 'Enter the admin access code to create an admin account.', type: 'error' }); return; }

    setLoading(true);
    setAlert(null);

    try {
      const data = await register({
        name, email, password, studentId, department: dept,
        role: wantsAdmin ? 'admin' : 'student',
        adminAccessCode: wantsAdmin ? adminCode : undefined
      });

      Notifications.add('Account created! Welcome to AI Academic Mentor 🎉', 'success');
      if (data.demoMode) {
        setAlert({ msg: 'Account created, but the backend is NOT connected to MongoDB right now — this account will be lost on server restart. Ask your backend teammate to check the server logs.', type: 'warning' });
        await new Promise(r => setTimeout(r, 2500));
      }
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setAlert({ msg: err.message || 'Registration failed. Is the backend server running?', type: 'error' });
      setLoading(false);
    }
  }

  return (
    <div className="register-page auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="logo-icon">⬡</span>
          <span>AI<strong>Mentor</strong></span>
        </Link>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join AI Academic Mentor — it's free</p>

        {alert && <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>{alert.msg}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-input" placeholder="Your full name" required minLength={3}
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="you@nubtk.edu" required
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Student ID</label>
              <input type="text" className="form-input" placeholder="1123012XXXX"
                value={form.studentId} onChange={e => set('studentId', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select className="form-input" value={form.dept} onChange={e => set('dept', e.target.value)}>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="BBA">BBA</option>
                <option value="English">English</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="Min 6 characters" required minLength={6}
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="form-input" placeholder="Repeat password" required
              value={form.confirm} onChange={e => set('confirm', e.target.value)} />
          </div>

          <label className="admin-code-toggle">
            <input type="checkbox" checked={form.wantsAdmin}
              onChange={e => set('wantsAdmin', e.target.checked)} />
            Registering as Administrator
          </label>
          <div className={`form-group${form.wantsAdmin ? ' show' : ''}`} id="adminCodeGroup">
            <label>Admin Access Code</label>
            <input type="password" className="form-input" placeholder="Enter admin access code"
              value={form.adminCode} onChange={e => set('adminCode', e.target.value)} />
            <div className="admin-code-hint">Required to create an admin account. Contact your supervisor for this code.</div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 6 }}>
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
