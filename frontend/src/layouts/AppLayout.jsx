import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Notifications, NOTIF_EVENT } from '../services/localStore';

export default function AppLayout({ title, subtitle, actions, children, bodyClassName = '', bodyStyle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [, forceTick] = useState(0);
  const navigate = useNavigate();
  const notifCount = Notifications.unreadCount();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    const onNotif = () => forceTick(t => t + 1);
    window.addEventListener(NOTIF_EVENT, onNotif);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener(NOTIF_EVENT, onNotif);
    };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="topbar">
          <button
            className="btn-ghost"
            onClick={() => setSidebarOpen(o => !o)}
            style={{ display: isMobile ? 'flex' : 'none', padding: 8 }}
            id="mobMenuBtn"
          >
            ☰
          </button>
          <div>
            <div className="topbar-title">{title}</div>
            <div className="topbar-sub">{subtitle}</div>
          </div>
          <div className="topbar-actions">
            {actions}
            <div className="notif-btn" onClick={() => navigate('/notifications')}>
              🔔
              {notifCount > 0 && <div className="notif-badge">{notifCount}</div>}
            </div>
            <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }} className="btn-ghost" style={{ padding: '8px 12px' }}>⚙</a>
          </div>
        </header>
        <div className={`page-body${bodyClassName ? ' ' + bodyClassName : ''}`} style={bodyStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
