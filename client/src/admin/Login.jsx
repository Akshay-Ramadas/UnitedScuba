import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './auth.jsx';
import { LOGO } from '../lib/api.js';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
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
    <div className="admin-shell sh-login-bg">
      <div className="sh-login-card">
        <div className="sh-login-header">
          <img className="sh-login-logo" src={LOGO} alt="United Scuba" />
          <h1 className="sh-login-title">Admin Panel</h1>
          <p className="sh-login-desc">Sign in to manage your dive centre</p>
        </div>

        <Card>
          <CardContent style={{ paddingTop: '1.5rem' }}>
            <form className="sh-form" onSubmit={onSubmit}>
              {error && (
                <div className="sh-alert sh-alert-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="sh-field">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email" type="email" placeholder="admin@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="username"
                />
              </div>

              <div className="sh-field">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                />
              </div>

              <Button type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                {saving ? 'Signing in…' : <><Lock size={15} /> Sign in</>}
              </Button>

              <p style={{ fontSize: '0.78rem', color: 'hsl(215 20% 55%)', textAlign: 'center', lineHeight: 1.5 }}>
                Credentials are set in your server{' '}
                <code style={{ background: 'hsl(210 40% 96%)', padding: '1px 5px', borderRadius: 4, fontSize: '0.75rem' }}>.env</code>{' '}
                file. No public registration.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
