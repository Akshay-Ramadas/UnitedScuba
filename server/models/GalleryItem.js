import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    category: {
      type: String,
      enum: ['scuba', 'snorkelling', 'marine', 'courses', 'customers', 'boat', 'video'],
      default: 'scuba',
    },
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GalleryItem = mongoose.model('GalleryItem', gallerySchema);
