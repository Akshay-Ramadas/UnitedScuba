import mongoose from 'mongoose';

const faqItem = new mongoose.Schema(
  { q: String, a: String },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, trim: true, maxlength: 40 },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    overview: { type: String, default: '' },
    whoCanParticipate: { type: String, default: '' },
    details: { type: String, default: '' },
    duration: { type: String, default: '' },
    price: { type: String, default: 'On request' },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    equipment: { type: String, default: '' },
    requirements: { type: String, default: '' },
    safety: { type: String, default: '' },
    whatToBring: { type: [String], default: [] },
    meetingPoint: { type: String, default: '' },
    faqs: { type: [faqItem], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', activitySchema);
