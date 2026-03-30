import { Schema, model, Types } from 'mongoose';
import { ISocialPost } from '../types/index.js';

const socialPostSchema = new Schema<ISocialPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: String,
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    video: {
      type: String,
      default: null,
    },
    linkedProducts: {
      type: [Types.ObjectId],
      ref: 'Product',
      default: [],
    },
    engagement: {
      likes: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    collection: 'social_posts',
  }
);

// Index for sorting by date
socialPostSchema.index({ createdAt: -1 });

export const SocialPost = model<ISocialPost>('SocialPost', socialPostSchema);
