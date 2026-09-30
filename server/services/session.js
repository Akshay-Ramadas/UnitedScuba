import crypto from 'crypto';

const TOKEN_DAYS = 7;

function adminEmail() {
  return String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
}

function adminPassword() {
  return String(process.env.ADMIN_PASSWORD || '');
}

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    crypto.createHash('sha256').update(`united-scuba:${adminEmail()}:${adminPassword()}`).digest('hex')
  );
}

function hmac(value) {
  return crypto.createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  const max = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(max);
  const paddedRight = Buffer.alloc(max);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return crypto.timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
}

export function adminConfigured() {
  return Boolean(adminEmail() && adminPassword());
}

export function signAdminToken(email) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || !token.includes('.')) {
    throw new Error('Invalid session');
  }
  const [payload, signature] = token.split('.');
  if (!safeEqual(signature, hmac(payload))) {
    throw new Error('Invalid session');
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (!data.exp || data.exp < Date.now()) {
    throw new Error('Session expired');
  }
  if (!safeEqual(String(data.email || '').toLowerCase(), adminEmail())) {
    throw new Error('Invalid session');
  }
  return { email: data.email, uid: 'admin' };
}

export function loginAdmin(email, password) {
  if (!adminConfigured()) {
    const err = new Error('Admin email and password are not set in the server environment');
    err.status = 503;
    throw err;
  }
  const okEmail = safeEqual(String(email || '').trim().toLowerCase(), adminEmail());
  const okPass = safeEqual(String(password || ''), adminPassword());
  if (!okEmail || !okPass) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const normalised = adminEmail();
  return {
    token: signAdminToken(normalised),
    email: normalised,
  };
}
