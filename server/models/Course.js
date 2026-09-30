import mongoose from 'mongoose';

const faqItem = new mongoose.Schema(
  { q: String, a: String },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, enum: ['recreational', 'professional'], default: 'recreational' },
    excerpt: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    overview: { type: String, default: '' },
    whoFor: { type: String, default: '' },
    prerequisites: { type: [String], default: [] },
    whatYouLearn: { type: [String], default: [] },
    structure: { type: String, default: '' },
    schedule: { type: String, default: '' },
    duration: { type: String, default: '' },
    divingDetails: { type: String, default: '' },
    included: { type: [String], default: [] },
    notIncluded: { type: [String], default: [] },
    equipment: { type: String, default: '' },
    certification: { type: String, default: '' },
    safety: { type: String, default: '' },
    documents: { type: [String], default: [] },
    price: { type: String, default: 'On request' },
    paymentInfo: { type: String, default: '' },
    availableDates: { type: String, default: 'Enquire for upcoming dates' },
    faqs: { type: [faqItem], default: [] },
    relatedSlugs: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
