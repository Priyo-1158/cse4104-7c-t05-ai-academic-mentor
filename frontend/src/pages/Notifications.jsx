import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { DataStore, Notifications as NotifStore, NOTIF_EVENT } from '../services/localStore';
import { timeAgo } from '../utils/helpers';
import './Notifications.css';

const TYPE_ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(() => NotifStore.get());
  const unread = notifs.filter(n => !n.read).length;

  function markAllRead() {
    NotifStore.markRead();
    setNotifs(NotifStore.get());
  }

  function clearNotifs() {
    if (!confirm('Clear all notifications?')) return;
    DataStore.set('notifications', []);
    setNotifs([]);
    window.dispatchEvent(new Event(NOTIF_EVENT));
  }

  return (
    <AppLayout
      title="🔔 Notifications"
      subtitle={unread ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up'}
      bodyStyle={{ maxWidth: 700 }}
      actions={
        <>
          <button className="btn-ghost" onClick={markAllRead} style={{ fontSize: '0.82rem' }}>Mark all read</button>
          <button className="btn-ghost" onClick={clearNotifs} style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Clear all</button>
        </>
      }
    >
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!notifs.length ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>No notifications yet. Start using AI features to see activity here.</p>
          </div>
        ) : notifs.map((n, i) => (
          <div className={`notif-item${n.read ? '' : ' unread'}`} style={{ animationDelay: `${i * 0.04}s` }} key={n.id}>
            <div className={`notif-dot ${n.read ? 'read' : 'unread'}`} />
            <div className="notif-icon">{TYPE_ICONS[n.type] || '🔔'}</div>
            <div className="notif-body">
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{timeAgo(n.time)}</div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
