import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'us_admin_token';
const EMAIL_KEY = 'us_admin_email';

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [email, setEmail] = useState(() => sessionStorage.getItem(EMAIL_KEY) || '');

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
