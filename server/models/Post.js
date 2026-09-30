import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    category: {
      type: String,
      enum: ['scuba', 'snorkelling', 'beginner', 'courses', 'info', 'travel', 'safety'],
      default: 'info',
    },
    coverImage: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Post = mongoose.model('Post', postSchema);
