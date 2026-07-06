// Ported 1:1 from Frontend/components/auth.js

export function timeAgo(isoStr) {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return new Date(isoStr).toLocaleDateString();
}

export function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str || ''));
  return d.innerHTML;
}

export function formatMarkdown(text) {
  return (text || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-3);padding:2px 6px;border-radius:4px;font-family:var(--mono);font-size:0.85em;">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)/, '<p>$1</p>');
}

export function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
