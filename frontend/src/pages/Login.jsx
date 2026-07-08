import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Notifications } from '../services/localStore';
import './Login.css';

export default function Login() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('role') === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { msg, type }

  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const data = await login(email.trim(), password);
      const user = data.user;

      if (!user.isActive) {
        setAlert({ msg: 'Your account has been suspended. Contact your administrator.', type: 'error' });
        localStorage.removeItem('aim_user');
        setLoading(false);
        return;
      }

      if (isAdminMode && user.role !== 'admin') {
        setAlert({ msg: 'This login is for administrators only. Use the regular Sign In instead.', type: 'error' });
        localStorage.removeItem('aim_user');
        setLoading(false);
        return;
      }

      Notifications.add('Welcome back, ' + user.name + '! 👋', 'success');
      if (data.demoMode) {
        setAlert({ msg: 'Signed in, but the backend is NOT connected to MongoDB right now (demo mode).', type: 'warning' });
        await new Promise(r => setTimeout(r, 1500));
      }
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setAlert({ msg: err.message || 'Invalid email or password. Please try again.', type: 'error' });
      setLoading(false);
    }
  }

  return (
    <div className="login-page auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={isAdminMode ? { borderColor: 'rgba(245,158,11,0.35)', boxShadow: 'var(--shadow-lg),0 0 40px rgba(245,158,11,0.08)' } : undefined}>
        <Link to="/" className="auth-logo">
          <span className="logo-icon">⬡</span>
          <span>AI<strong>Mentor</strong></span>
        </Link>

        {isAdminMode && <div className="admin-badge">🛡 Admin Login</div>}

        <h1 className="auth-title">{isAdminMode ? 'Admin Access' : 'Welcome back'}</h1>
        <p className="auth-sub">{isAdminMode ? 'Sign in with your administrator credentials' : 'Sign in to your student account'}</p>

        {alert && <div className={`alert alert-${alert.type}`} style={{ marginBottom: 16 }}>{alert.msg}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="you@nubtk.edu" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" placeholder="••••••••" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one free →</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 6 }}>
          <Link to="/">← Back to home</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 6 }}>
          {isAdminMode ? (
            <Link to="/login">← Sign in as Student instead</Link>
          ) : (
            <Link to="/login?role=admin">🛡 Admin? Login here →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
