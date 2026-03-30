import { Schema, model } from 'mongoose';
import { INewsletterSubscription } from '../types/index.js';

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'newsletter_subscriptions',
  }
);

// Indexes for faster queries
newsletterSubscriptionSchema.index({ isSubscribed: 1 });

export const NewsletterSubscription = model<INewsletterSubscription>(
  'NewsletterSubscription',
  newsletterSubscriptionSchema
);
