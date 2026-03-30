import { Schema, model, Types } from 'mongoose';

export interface IReview {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  comment: string;
  helpful: number; // count of helpful votes
  unhelpful: number; // count of unhelpful votes
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: null,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
      min: 0,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
);

// Indexes
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ productId: 1, rating: 1 });

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = model<IReview>('Review', reviewSchema);
