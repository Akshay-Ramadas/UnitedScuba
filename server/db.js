import mongoose from 'mongoose';
import { Course } from './models/Course.js';
import { Activity } from './models/Activity.js';
import { Settings } from './models/Settings.js';
import { GalleryItem } from './models/GalleryItem.js';
import { Faq } from './models/Faq.js';
import { Review } from './models/Review.js';
import { Post } from './models/Post.js';
import {
  defaultCourses,
  defaultActivities,
  defaultSettings,
  defaultGallery,
  defaultFaqs,
  defaultReviews,
  defaultPosts,
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
  console.log('[db] Seed check complete');
}

export function fallbackContent() {
  return {
    settings: defaultSettings,
    courses: defaultCourses,
    activities: defaultActivities,
    faqs: defaultFaqs,
    reviews: defaultReviews,
    posts: defaultPosts,
    gallery: defaultGallery,
  };
}
