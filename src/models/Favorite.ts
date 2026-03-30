import { Schema, model } from 'mongoose';
import { IFavorite } from '../types/index.js';

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'favorites',
  }
);

// Compound index to prevent duplicates and speed up queries
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
