import { getStoredAuth } from './api';

// ─── Local cache for offline / instant UI rendering only.
// The backend (MongoDB) is always the source of truth — see BackendAPI.
export const DataStore = {
  KEY_PREFIX: 'aim_cache_',
  key(section, userId) {
    const uid = userId || getStoredAuth()?.id || 'guest';
    return this.KEY_PREFIX + uid + '_' + section;
  },
  get(section, userId) {
    try { return JSON.parse(localStorage.getItem(this.key(section, userId)) || 'null'); }
    catch { return null; }
  },
  set(section, data, userId) {
    localStorage.setItem(this.key(section, userId), JSON.stringify(data));
  },
  push(section, item, userId) {
    const arr = this.get(section, userId) || [];
    arr.unshift(item);
    this.set(section, arr, userId);
    return arr;
  },
  getForUser(userId, section) { return this.get(section, userId); }
};

// Notification store (local-only feature, not backed by a Mongo model)
export const NOTIF_EVENT = 'aim:notifications-changed';

export const Notifications = {
  get() { return DataStore.get('notifications') || []; },
  add(text, type = 'info') {
    DataStore.push('notifications', {
      id: Date.now(), text, type, read: false, time: new Date().toISOString()
    });
    window.dispatchEvent(new Event(NOTIF_EVENT));
  },
  markRead() {
    const n = this.get().map(n => ({ ...n, read: true }));
    DataStore.set('notifications', n);
    window.dispatchEvent(new Event(NOTIF_EVENT));
  },
  unreadCount() { return this.get().filter(n => !n.read).length; }
};
