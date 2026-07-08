import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Notifications, NOTIF_EVENT } from '../services/localStore';
import { escapeHtml } from '../utils/helpers';

const navItems = [
  { href: '/dashboard',  icon: '⬡',  label: 'Dashboard' },
  { href: '/chatbot',    icon: '🤖', label: 'AI Chatbot' },
  { href: '/quiz',       icon: '⚡', label: 'Quiz Generator' },
  { href: '/summarizer', icon: '📝', label: 'Note Summarizer' },
  { href: '/planner',    icon: '📅', label: 'Study Planner' },
  { href: '/progress',   icon: '📊', label: 'Progress' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, initials } = useAuth();
  const [, forceTick] = useState(0);

  useEffect(() => {
    const handler = () => forceTick(t => t + 1);
    window.addEventListener(NOTIF_EVENT, handler);
    return () => window.removeEventListener(NOTIF_EVENT, handler);
  }, []);

  if (!user) return null;

  const notifCount = Notifications.unreadCount();

  const linkClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
        <NavLink to="/dashboard" className="sidebar-logo">
          <span className="logo-icon">⬡</span>
          <span>AI<strong>Mentor</strong></span>
        </NavLink>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map(item => (
            <NavLink key={item.href} to={item.href} className={linkClass} onClick={onClose}>
              <span className="nav-icon">{item.icon}</span> {item.label}
            </NavLink>
          ))}
          <div className="sidebar-section-label">System</div>
          <NavLink to="/notifications" className={linkClass} onClick={onClose}>
            <span className="nav-icon">🔔</span> Notifications
            {notifCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent-2)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>
                {notifCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            <span className="nav-icon">⚙</span> Settings
          </NavLink>
          {user.role === 'admin' && (
            <>
              <div className="sidebar-section-label">Administration</div>
              <NavLink
                to="/admin"
                className={linkClass}
                onClick={onClose}
                style={({ isActive }) => (isActive ? {} : { color: '#f0c060' })}
              >
                <span className="nav-icon">🛡</span> Admin Panel
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={logout} title="Sign out">
            <div className="user-avatar">{initials(user.name)}</div>
            <div className="user-info">
              <div className="user-name" dangerouslySetInnerHTML={{ __html: escapeHtml(user.name) }} />
              <div className="user-role">{user.role === 'admin' ? '🛡 Admin' : '🎓 Student'} · Sign out</div>
            </div>
          </div>
        </div>
      </aside>
      <div className={`sidebar-overlay${isOpen ? ' active' : ''}`} onClick={onClose} />
    </>
  );
}
