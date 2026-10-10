import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    preferredDate: { type: String, default: '' },
    numberOfPeople: { type: Number, default: 1 },
    activityType: {
      type: String,
      enum: ['scuba', 'snorkelling', 'course', 'general'],
      default: 'general',
    },
    diverLevel: {
      type: String,
      enum: ['beginner', 'certified', 'not-sure', 'snorkelling', ''],
      default: '',
    },
    preferredItem: { type: String, default: '' },
    diveSites: { type: String, default: '' },
    plan: { type: String, default: '' },
    message: { type: String, default: '' },
    source: { type: String, enum: ['book-now', 'contact', 'plan-dive'], default: 'book-now' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'completed', 'closed'],
      default: 'new',
    },
    whatsappOptIn: { type: Boolean, default: true },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ status: 1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
