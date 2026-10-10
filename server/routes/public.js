import { Router } from 'express';
import { z } from 'zod';
import { Course } from '../models/Course.js';
import { Activity } from '../models/Activity.js';
import { Settings } from '../models/Settings.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { Faq } from '../models/Faq.js';
import { Review } from '../models/Review.js';
import { Post } from '../models/Post.js';
import { DiveSite } from '../models/DiveSite.js';
import { fallbackContent, mongoReady } from '../db.js';
import { validate } from '../middleware/validate.js';
import { sendBusinessNotification, sendCustomerAcknowledgement } from '../services/mail.js';
import { Enquiry } from '../models/Enquiry.js';

export const publicRouter = Router();

function published(docs) {
  return docs.filter((d) => d.published !== false);
}

publicRouter.get('/health', (_req, res) => {
  res.json({ ok: true, db: mongoReady });
});

/* ── Google review badge — returns admin-configured values from Settings ── */
publicRouter.get('/google-rating', async (_req, res, next) => {
  try {
    const settings = mongoReady
      ? await Settings.findOne({ key: 'site' }).lean()
      : fallbackContent().settings;

    res.json({
      rating:  settings?.googleRating        ?? 4.7,
      count:   settings?.googleReviewCount   ?? 349,
      mapsUrl: settings?.googleMapsReviewUrl
               || 'https://maps.google.com/?q=United+Scuba+Dive+Centre+Havelock+Island',
    });
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/content', async (_req, res, next) => {
  try {
    if (!mongoReady) {
      const fb = fallbackContent();
      return res.json({
        settings: fb.settings,
        courses: fb.courses,
        activities: fb.activities,
        faqs: fb.faqs,
        reviews: fb.reviews,
        posts: fb.posts.filter((p) => p.published),
        gallery: fb.gallery,
        diveSites: (fb.diveSites || []).filter((site) => site.published !== false),
      });
    }

    const [settings, courses, activities, faqs, reviews, posts, gallery, diveSites] = await Promise.all([
      Settings.findOne({ key: 'site' }).lean(),
      Course.find({ published: true }).sort({ sortOrder: 1, title: 1 }).lean(),
      Activity.find({ published: true }).sort({ sortOrder: 1, title: 1 }).lean(),
      Faq.find().sort({ page: 1, sortOrder: 1 }).lean(),
      Review.find({ featured: true }).sort({ sortOrder: 1, createdAt: -1 }).lean(),
      Post.find({ published: true }).sort({ sortOrder: 1, publishedAt: -1 }).lean(),
      GalleryItem.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
      DiveSite.find({ published: true }).sort({ sortOrder: 1, title: 1 }).lean(),
    ]);

    res.json({
      settings: settings || fallbackContent().settings,
      courses,
      activities,
      faqs,
      reviews,
      posts,
      gallery,
      diveSites,
    });
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/courses/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (!mongoReady) {
      const item = fallbackContent().courses.find((c) => c.slug === slug);
      if (!item) return res.status(404).json({ error: 'Course not found' });
      return res.json(item);
    }
    const item = await Course.findOne({ slug, published: true }).lean();
    if (!item) return res.status(404).json({ error: 'Course not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/activities/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (!mongoReady) {
      const item = fallbackContent().activities.find((c) => c.slug === slug);
      if (!item) return res.status(404).json({ error: 'Activity not found' });
      return res.json(item);
    }
    const item = await Activity.findOne({ slug, published: true }).lean();
    if (!item) return res.status(404).json({ error: 'Activity not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/posts/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (!mongoReady) {
      const item = published(fallbackContent().posts).find((c) => c.slug === slug);
      if (!item) return res.status(404).json({ error: 'Article not found' });
      return res.json(item);
    }
    const item = await Post.findOne({ slug, published: true }).lean();
    if (!item) return res.status(404).json({ error: 'Article not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().max(160).optional().default('')
    .refine((value) => value === '' || z.string().email().safeParse(value).success, 'Enter a valid email'),
  preferredDate: z.string().trim().max(40).optional().default(''),
  numberOfPeople: z.coerce.number().int().min(1).max(40).optional().default(1),
  activityType: z.enum(['scuba', 'snorkelling', 'course', 'general']).optional().default('general'),
  diverLevel: z.enum(['beginner', 'certified', 'not-sure', 'snorkelling', '']).optional().default(''),
  preferredItem: z.string().trim().max(200).optional().default(''),
  diveSites: z.string().trim().max(500).optional().default(''),
  plan: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(4000).optional().default(''),
  source: z.enum(['book-now', 'contact', 'plan-dive']).optional().default('book-now'),
  whatsappOptIn: z.boolean().optional().default(true),
  website: z.string().optional().default(''),
});

async function deliverEnquiryMail(enquiry) {
  const jobs = [
    ['admin', () => sendBusinessNotification(enquiry)],
  ];
  if (enquiry.email) jobs.push(['customer', () => sendCustomerAcknowledgement(enquiry)]);
  const results = await Promise.allSettled(jobs.map(([, run]) => run()));
  results.forEach((result, index) => {
    const who = jobs[index][0];
    if (result.status === 'rejected') {
      console.error(`[mail] ${who} email failed:`, result.reason?.message || result.reason);
    }
  });
}

publicRouter.post('/enquiries', validate(enquirySchema), async (req, res, next) => {
  try {
    if (req.body.website) {
      return res.status(201).json({ ok: true });
    }

    const payload = { ...req.body };
    delete payload.website;

    if (!mongoReady) {
      console.warn('[enquiry] Saved to log only (no database):', payload.email);
      await deliverEnquiryMail(payload);
      return res.status(201).json({ ok: true, stored: false });
    }

    const enquiry = await Enquiry.create(payload);
    await deliverEnquiryMail(enquiry.toObject());
    res.status(201).json({ ok: true, id: enquiry._id });
  } catch (err) {
    next(err);
  }
});
