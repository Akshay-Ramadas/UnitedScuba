import mongoose from 'mongoose';
import { Course } from './models/Course.js';
import { Activity } from './models/Activity.js';
import { Settings } from './models/Settings.js';
import { GalleryItem } from './models/GalleryItem.js';
import { Faq } from './models/Faq.js';
import { Review } from './models/Review.js';
import { Post } from './models/Post.js';
import { DiveSite } from './models/DiveSite.js';
import { plansFromPaymentInfo } from './plansFromPriceList.js';
import {
  defaultCourses,
  defaultActivities,
  defaultSettings,
  defaultGallery,
  defaultFaqs,
  defaultReviews,
  defaultPosts,
  defaultDiveSites,
} from './data/defaults.js';

export let mongoReady = false;

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI missing — public pages use built-in content until you add Atlas.');
    return false;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,   // fail fast in dev
    tls: true,
    tlsAllowInvalidCertificates: false,
  });
  mongoReady = true;
  console.log('[db] Connected to MongoDB');
  await seedIfEmpty();
  return true;
}

export async function seedIfEmpty() {
  if (!mongoReady) return;

  if ((await Settings.countDocuments()) === 0) {
    await Settings.create(defaultSettings);
  }
  if ((await Course.countDocuments()) === 0) {
    await Course.insertMany(defaultCourses);
  }
  if ((await Activity.countDocuments()) === 0) {
    await Activity.insertMany(defaultActivities);
  }
  if ((await Faq.countDocuments()) === 0) {
    await Faq.insertMany(defaultFaqs);
  }
  if ((await Review.countDocuments()) === 0) {
    await Review.insertMany(defaultReviews);
  }
  if ((await Post.countDocuments()) === 0) {
    await Post.insertMany(defaultPosts);
  }
  if ((await GalleryItem.countDocuments()) === 0) {
    await GalleryItem.insertMany(defaultGallery);
  }
  if ((await DiveSite.countDocuments()) === 0) {
    await DiveSite.insertMany(defaultDiveSites);
  }
  await migrateCoursePlans();
  await migrateDiveGroups();
  console.log('[db] Seed check complete');
}

const DIVE_GROUPS = [
  {
    slug: 'shore-dive',
    type: 'scuba',
    audience: 'beginner',
    noSwimming: true,
    title: 'Shore Dive',
    excerpt: 'Walk in from the beach and explore a calm, shallow reef with your instructor beside you.',
    sortOrder: 1,
  },
  {
    slug: 'boat-dive',
    type: 'scuba',
    audience: 'beginner',
    noSwimming: false,
    title: 'Boat Dive',
    excerpt: 'Head out by boat to Andaman coral sites for more reef and variety.',
    sortOrder: 2,
  },
  {
    slug: 'discover-scuba-diving-activity',
    type: 'scuba',
    audience: 'beginner',
    noSwimming: true,
    title: 'Discover Scuba Diving',
    excerpt: 'Your first breath underwater with a guided introduction, no experience needed.',
    sortOrder: 3,
  },
  {
    slug: 'fun-diving',
    type: 'scuba',
    audience: 'certified',
    noSwimming: false,
    title: 'Fun Dives',
    excerpt: "Guided reef dives for certified divers exploring Andaman's underwater world.",
    sortOrder: 4,
  },
  {
    slug: 'scuba-refresher',
    type: 'scuba',
    audience: 'certified',
    noSwimming: false,
    title: 'Scuba Refresher',
    excerpt: "Brush up your skills with an instructor if it's been a while since your last dive.",
    sortOrder: 5,
  },
  {
    slug: 'snorkeling',
    type: 'snorkelling',
    audience: 'snorkelling',
    noSwimming: false,
    title: 'Shore Snorkelling',
    excerpt: 'Walk in from the beach and float over the reef at your own pace, with a guide nearby.',
    sortOrder: 6,
  },
  {
    slug: 'boat-snorkelling',
    type: 'snorkelling',
    audience: 'snorkelling',
    noSwimming: false,
    title: 'Boat Snorkelling',
    excerpt: 'Take a boat to a reef site further out for more corals and fish.',
    sortOrder: 7,
  },
];

async function migrateDiveGroups() {
  for (const item of DIVE_GROUPS) {
    const existing = await Activity.findOne({ slug: item.slug });
    if (!existing) {
      await Activity.create({
        ...item,
        price: 'On request',
        published: true,
        heroImage: '',
      });
      continue;
    }
    if (existing.audience) continue;
    existing.audience = item.audience;
    existing.noSwimming = item.noSwimming;
    existing.title = item.title;
    existing.excerpt = item.excerpt;
    existing.sortOrder = item.sortOrder;
    await existing.save();
  }

  const sites = await DiveSite.find({ certifiedOnly: { $exists: false } });
  for (const site of sites) {
    const level = String(site.level || '');
    site.certifiedOnly = /certified/i.test(level) && !/beginner/i.test(level);
    await site.save();
  }
}

async function migrateCoursePlans() {
  const courses = await Course.find();
  for (const course of courses) {
    if (Array.isArray(course.plans) && course.plans.length) continue;
    const parsed = plansFromPaymentInfo(course.paymentInfo);
    if (!parsed.plans.length) continue;
    course.plans = parsed.plans;
    if (!course.planNote) course.planNote = parsed.planNote;
    course.paymentInfo = '';
    await course.save();
  }
}

export function fallbackContent() {
  return {
    settings: defaultSettings,
    courses: defaultCourses.map((course) => {
      if (course.plans?.length) return course;
      const parsed = plansFromPaymentInfo(course.paymentInfo);
      if (!parsed.plans.length) return course;
      return { ...course, plans: parsed.plans, planNote: parsed.planNote };
    }),
    activities: defaultActivities,
    faqs: defaultFaqs,
    reviews: defaultReviews,
    posts: defaultPosts,
    gallery: defaultGallery,
    diveSites: defaultDiveSites,
  };
}
