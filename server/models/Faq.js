import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    page: {
      type: String,
      enum: ['home', 'scuba', 'snorkelling', 'courses', 'about'],
      default: 'home',
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Faq = mongoose.model('Faq', faqSchema);
