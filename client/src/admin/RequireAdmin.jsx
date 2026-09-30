import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './auth.jsx';

export default function RequireAdmin({ children }) {
  const { user, ready } = useAdminAuth();
  if (!ready) return <p style={{ padding: 24 }}>Loading…</p>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
