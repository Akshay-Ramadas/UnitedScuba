import mongoose from 'mongoose';

const diveSiteSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    description: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    depth: { type: String, default: '' },
    level: { type: String, default: '' },
    certifiedOnly: { type: Boolean, default: false },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DiveSite = mongoose.model('DiveSite', diveSiteSchema);
