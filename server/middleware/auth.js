import { verifyAdminToken } from '../services/session.js';

export function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      return res.status(401).json({ error: 'Sign in required' });
    }
    req.user = verifyAdminToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
