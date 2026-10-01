import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './auth.jsx';
import { LOGO } from '../lib/api.js';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { AlertCircle, Lock } from '../components/ui/icons.jsx';
import './shadcn.css';

export default function Login() {
  const { user, login } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try { await login(email, password); }
    catch (err) { setError(err.message || 'Sign in failed'); }
    finally { setSaving(false); }
  }

  return (
    <div className="admin-shell sh-login">
      <aside className="sh-login-visual" aria-hidden="true">
        <div className="sh-login-visual-shade" />
        <div className="sh-login-visual-copy">
          <img className="sh-login-logo" src={LOGO} alt="" />
          <p>Havelock Island · Swaraj Dweep</p>
        </div>
      </aside>

      <main className="sh-login-panel">
        <div className="sh-login-card">
          <p className="sh-login-kicker">Admin</p>
          <h1 className="sh-login-title">Sign in</h1>
          <p className="sh-login-desc">Manage bookings, courses, and the dive centre.</p>

          <form className="sh-form sh-login-form" onSubmit={onSubmit}>
            {error && (
              <div className="sh-alert sh-alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="sh-field">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email" type="email" placeholder="you@unitedscuba.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="username"
              />
            </div>

            <div className="sh-field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" type="password" placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="sh-login-submit" disabled={saving}>
              {saving ? 'Signing in…' : <><Lock size={15} /> Sign in</>}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
