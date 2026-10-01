import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDb } from './db.js';
import { initCloudinary } from './services/cloudinary.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { buildSitemapUrls, llmsTxt, robotsTxt, sitemapXml } from './seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const isProd = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 5000;

initCloudinary();
try {
  await connectDb();
} catch (err) {
  console.warn('[db] MongoDB unavailable — server will run with built-in default content.');
  console.warn('[db] Reason:', err.message?.split('\n')[0] ?? err.code ?? err);
}

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Vercel may hand this app only part of the path. Put the real request path back.
app.use((req, _res, next) => {
  if (!process.env.VERCEL) return next();
  const header = req.headers['x-forwarded-uri'] || req.headers['x-vercel-original-url'] || req.headers['x-invoke-path'] || '';
  const candidates = [header, req.originalUrl, req.url].filter(Boolean).map(String);
  const found = candidates.find((value) => {
    const pathOnly = value.startsWith('http') ? new URL(value).pathname : value.split('?')[0];
    return pathOnly.startsWith('/api') || pathOnly === '/sitemap.xml' || pathOnly === '/robots.txt' || pathOnly === '/llms.txt';
  });
  if (!found) return next();
  req.url = found.startsWith('http') ? `${new URL(found).pathname}${new URL(found).search}` : found;
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
        connectSrc: [
          "'self'",
          'https://www.google-analytics.com',
          'https://*.google-analytics.com',
          'https://api.cloudinary.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://www.google-analytics.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: isProd ? process.env.SITE_URL || true : process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait and try again.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait and try again.' },
});

app.use('/api', apiLimiter);
app.use('/api/enquiries', formLimiter);
app.use('/enquiries', formLimiter);
app.use('/api/admin/login', loginLimiter);
app.use('/admin/login', loginLimiter);
app.use('/api/admin', adminRouter);
app.use('/admin', adminRouter);
app.use('/api', publicRouter);
app.use(publicRouter);

app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const urls = await buildSitemapUrls();
    res.type('application/xml').send(sitemapXml(urls));
  } catch (err) {
    next(err);
  }
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(robotsTxt());
});

app.get('/llms.txt', async (_req, res, next) => {
  try {
    res.type('text/plain; charset=utf-8').send(await llmsTxt());
  } catch (err) {
    next(err);
  }
});

app.use(express.static(clientDist, { index: false, maxAge: isProd ? '7d' : 0 }));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/google-rating' || req.path === '/content' || req.path === '/health') {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[united-scuba] listening on ${port}`);
  });
}
