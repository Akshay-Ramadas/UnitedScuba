import { Router } from 'express';
import { z } from 'zod';
import { Course } from '../models/Course.js';
import { Activity } from '../models/Activity.js';
import { Settings } from '../models/Settings.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Faq } from '../models/Faq.js';
import { Review } from '../models/Review.js';
import { Post } from '../models/Post.js';
import { Enquiry } from '../models/Enquiry.js';
import { mongoReady } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { destroyImage, signUpload } from '../services/cloudinary.js';
import { loginAdmin } from '../services/session.js';
import sanitizeHtml from 'sanitize-html';

export const adminRouter = Router();

adminRouter.post(
  '/login',
  validate(
    z.object({
      email: z.string().trim().email().max(160),
      password: z.string().min(1).max(200),
    })
  ),
  (req, res, next) => {
    try {
      const session = loginAdmin(req.body.email, req.body.password);
      res.json(session);
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.use(requireAdmin);

function requireDb(res) {
  if (!mongoReady) {
    res.status(503).json({ error: 'Database is not connected. Set MONGODB_URI and restart.' });
    return false;
  }
  return true;
}

const cleanHtml = (value = '') =>
  sanitizeHtml(String(value), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
    },
  });

adminRouter.get('/me', (req, res) => {
  res.json({ email: req.user.email, uid: req.user.uid });
});

adminRouter.get('/enquiries', async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const status = req.query.status;
    const filter = status ? { status } : {};
    const items = await Enquiry.find(filter).sort({ createdAt: -1, _id: -1 }).limit(300).lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

const ENQUIRY_STATUSES = ['new', 'contacted', 'in-progress', 'completed', 'closed'];

adminRouter.patch(
  '/enquiries/:id',
  validate(z.object({ status: z.enum(ENQUIRY_STATUSES) })),
  async (req, res, next) => {
    try {
      if (!requireDb(res)) return;
      const current = await Enquiry.findById(req.params.id);
      if (!current) return res.status(404).json({ error: 'Not found' });
      const from = ENQUIRY_STATUSES.indexOf(current.status || 'new');
      const to = ENQUIRY_STATUSES.indexOf(req.body.status);
      if (to < from) {
        return res.status(400).json({ error: 'Status can only move forward.' });
      }
      current.status = req.body.status;
      await current.save();
      res.json(current);
    } catch (err) {
      next(err);
    }
  }
);

function crud(path, Model, transform, hooks = {}) {
  adminRouter.get(path, async (_req, res, next) => {
    try {
      if (!requireDb(res)) return;
      const items = await Model.find().sort({ sortOrder: 1, createdAt: -1, publishedAt: -1 }).lean();
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  adminRouter.put(`${path}/order`, async (req, res, next) => {
    try {
      if (!requireDb(res)) return;
      const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
      await Promise.all(ids.map((id, index) => (
        Model.updateOne({ _id: id }, { $set: { sortOrder: index + 1 } })
      )));
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  adminRouter.post(path, async (req, res, next) => {
    try {
      if (!requireDb(res)) return;
      let body = transform ? transform(req.body) : req.body;
      if (hooks.beforeCreate) body = await hooks.beforeCreate(body);
      const item = await Model.create(body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  adminRouter.put(`${path}/:id`, async (req, res, next) => {
    try {
      if (!requireDb(res)) return;
      const body = transform ? transform(req.body) : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  adminRouter.delete(`${path}/:id`, async (req, res, next) => {
    try {
      if (!requireDb(res)) return;
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      if (hooks.beforeDelete) await hooks.beforeDelete(item);
      await item.deleteOne();
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
}

const withHtml = (fields) => (body) => {
  const next = { ...body };
  for (const field of fields) {
    if (typeof next[field] === 'string') next[field] = cleanHtml(next[field]);
  }
  return next;
};

/* Auto-generate slug + SEO fields for courses and activities */
function slugify(str) {
  return String(str || '').toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}
const autoFields = (body) => {
  const b = { ...body };
  if (!b.slug && b.title) b.slug = slugify(b.title);
  if (!b.seoTitle) b.seoTitle = (b.title ? `${b.title} | United Scuba` : '');
  if (!b.seoDescription && b.excerpt) b.seoDescription = b.excerpt.slice(0, 160).trim();
  return b;
};

crud('/courses',    Course,   autoFields);
crud('/activities', Activity, autoFields);
crud('/gallery', GalleryItem, null, {
  beforeCreate: async (body) => {
    const order = Number(body.sortOrder);
    if (Number.isFinite(order) && order > 0) return body;
    const last = await GalleryItem.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
    return { ...body, sortOrder: (Number(last?.sortOrder) || 0) + 1 };
  },
  beforeDelete: (item) => (
    item.publicId
      ? destroyImage(item.publicId, item.category === 'video' ? 'video' : 'image')
      : null
  ),
});
crud('/faqs', Faq);
crud('/reviews', Review);
crud('/posts', Post, withHtml(['content']));

adminRouter.get('/settings', async (_req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const item = await Settings.findOne({ key: 'site' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

adminRouter.put('/settings', async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const body = withHtml(['about', 'story', 'certifications', 'safety', 'equipment', 'privacy', 'terms', 'cancellation'])(
      req.body
    );
    const item = await Settings.findOneAndUpdate({ key: 'site' }, { ...body, key: 'site' }, { new: true, upsert: true });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/uploads/sign', (_req, res, next) => {
  try {
    res.json(signUpload('united-scuba'));
  } catch (err) {
    next(err);
  }
});
