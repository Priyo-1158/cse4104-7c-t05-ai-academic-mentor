import axios from 'axios';

// ─── API base ───────────────────────────────────────────────────
// Same logic as the original Frontend/components/auth.js:
// localhost -> local backend, otherwise -> deployed backend URL.
//
// ⚠️ ACTION REQUIRED BEFORE SUBMISSION/DEPLOY: replace PRODUCTION_API_BASE
// below with your real deployed backend URL (e.g. Render), no trailing slash.
// You can also just set VITE_API_BASE in a .env file to override both.
const PRODUCTION_API_BASE = 'https://YOUR-BACKEND.onrender.com'; // TODO: replace before submission

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : PRODUCTION_API_BASE);

if (API_BASE.includes('YOUR-BACKEND')) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ API_BASE is still a placeholder. Set VITE_API_BASE or PRODUCTION_API_BASE in src/services/api.js to your real deployed backend URL before submitting/demoing.');
}

const AUTH_KEY = 'aim_user';

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const http = axios.create({ baseURL: API_BASE });

// Attach JWT on every request, exactly like the old apiRequest() did.
http.interceptors.request.use((config) => {
  const stored = getStoredAuth();
  if (stored?.token) {
    config.headers.Authorization = 'Bearer ' + stored.token;
  }
  return config;
});

// Normalize errors to `err.message` the same way the old fetch-based
// apiRequest() did, so every existing .catch(err => err.message) call
// in the migrated pages keeps working unchanged.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err?.response?.data;
    const message = data?.error || data?.message || err.message || 'Server error';
    return Promise.reject(new Error(message));
  }
);

export async function apiRequest(method, endpoint, body) {
  const res = await http.request({ method, url: endpoint, data: body });
  return res.data;
}

export { AUTH_KEY, getStoredAuth };
