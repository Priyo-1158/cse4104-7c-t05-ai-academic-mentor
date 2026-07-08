import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Equivalent of the old Auth.require() redirect-to-login guard.
export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

// Equivalent of the old Auth.requireAdmin() guard.
export function AdminRoute({ children }) {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
