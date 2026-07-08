import { createContext, useContext, useState, useCallback } from 'react';
import { apiRequest, AUTH_KEY } from '../services/api';
import { initials } from '../utils/helpers';

const AuthContext = createContext(null);

function readStored() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored);

  const save = useCallback((u, token) => {
    const merged = { ...u, token: token ?? readStored()?.token };
    localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
    setUser(merged);
    return merged;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    window.location.href = '/';
  }, []);

  const register = useCallback(async ({ name, email, password, studentId, department, role, adminAccessCode }) => {
    const data = await apiRequest('POST', '/api/auth/register', {
      name, email, password, studentId, department, role, adminAccessCode
    });
    save(data.user, data.token);
    if (data.demoMode) {
      console.warn('Registered in DEMO MODE — MongoDB is not connected on the backend. This account will NOT persist.');
    }
    return data;
  }, [save]);

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('POST', '/api/auth/login', { email, password });
    save(data.user, data.token);
    if (data.demoMode) {
      console.warn('Logged in via DEMO MODE — MongoDB is not connected on the backend.');
    }
    return data;
  }, [save]);

  const refreshMe = useCallback(async () => {
    const data = await apiRequest('GET', '/api/auth/me');
    save(data.user);
    return data.user;
  }, [save]);

  const value = {
    user,
    isLoggedIn: !!user?.token,
    save,
    logout,
    register,
    login,
    refreshMe,
    initials: (name) => initials(name)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
