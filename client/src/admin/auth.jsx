import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'us_admin_token';
const EMAIL_KEY = 'us_admin_email';

function tokenExpiryMs(token) {
  const part = String(token || '').split('.')[1];
  if (String(token || '').split('.').length !== 3 || !part) return 0;
  try {
    const padded = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '=')));
    return typeof json.exp === 'number' ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function storedSession() {
  const token = sessionStorage.getItem(TOKEN_KEY) || '';
  const email = sessionStorage.getItem(EMAIL_KEY) || '';
  if (!token || tokenExpiryMs(token) <= Date.now()) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    return { token: '', email: '' };
  }
  return { token, email };
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => storedSession().token);
  const [email, setEmail] = useState(() => storedSession().email);

  async function login(nextEmail, password) {
    const session = await api('/api/admin/login', {
      method: 'POST',
      body: { email: nextEmail, password },
    });
    sessionStorage.setItem(TOKEN_KEY, session.token);
    sessionStorage.setItem(EMAIL_KEY, session.email);
    setToken(session.token);
    setEmail(session.email);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    setToken('');
    setEmail('');
  }

  useEffect(() => {
    if (!token) return undefined;
    const remaining = tokenExpiryMs(token) - Date.now();
    if (remaining <= 0) {
      logout();
      return undefined;
    }
    const timer = window.setTimeout(logout, remaining);
    const onUnauthorized = () => logout();
    window.addEventListener('us-admin-unauthorized', onUnauthorized);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('us-admin-unauthorized', onUnauthorized);
    };
  }, [token]);

  const value = useMemo(
    () => ({
      user: token ? { email } : null,
      token,
      ready: true,
      login,
      logout,
    }),
    [token, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
