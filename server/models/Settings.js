import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    companyName: { type: String, default: 'United Scuba' },
    tagline: { type: String, default: 'Scuba diving in the Andaman Islands' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    location: { type: String, default: 'Andaman Islands, India' },
    mapsUrl: { type: String, default: '' },
    mapsEmbed: { type: String, default: '' },
    hours: { type: String, default: 'Open daily 7:00 AM – 6:00 PM' },
    socials: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    about: { type: String, default: '' },
    story: { type: String, default: '' },
    certifications: { type: String, default: '' },
    safety: { type: String, default: '' },
    equipment: { type: String, default: '' },
    whyChoose: { type: [String], default: [] },
    privacy: { type: String, default: '' },
    terms: { type: String, default: '' },
    cancellation: { type: String, default: '' },
    ga4Id: { type: String, default: '' },
    /* Google Reviews widget */
    googleRating:        { type: Number, default: 4.7 },
    googleReviewCount:   { type: Number, default: 349 },
    googleMapsReviewUrl: { type: String, default: '' },
    seoTitle: { type: String, default: 'United Scuba | Scuba Diving in the Andaman Islands' },
    pages: { type: mongoose.Schema.Types.Mixed, default: {} },
    seoDescription: {
      type: String,
      default:
        'PADI scuba courses, fun dives and snorkelling with United Scuba. Book your Andaman diving experience.',
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
