import { Schema, model, Types } from 'mongoose';

export interface IWishlistShare {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  shareToken: string; // Unique token for the shareable link
  expiresAt?: Date; // Optional expiration date
  viewCount: number; // Number of views
  isActive: boolean; // Can be disabled by user
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistShareSchema = new Schema<IWishlistShare>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    shareToken: {
      type: String,
      required: [true, 'Share token is required'],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic deletion
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'wishlist_shares',
  }
);

// Indexes
wishlistShareSchema.index({ userId: 1 });
wishlistShareSchema.index({ shareToken: 1, isActive: 1 });
wishlistShareSchema.index({ createdAt: -1 });

export const WishlistShare = model<IWishlistShare>('WishlistShare', wishlistShareSchema);
