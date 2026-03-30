import { Schema, model, Types } from 'mongoose';

export interface ICoupon {
  _id?: Types.ObjectId;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (0-100) or fixed amount
  maxDiscount?: number; // max discount for percentage coupons
  minPurchaseAmount: number;
  maxUses?: number;
  usesCount: number;
  maxUsesPerUser?: number;
  usedByUsers: Types.ObjectId[];
  isActive: boolean;
  startDate: Date;
  expiryDate: Date;
  applicableCategories?: string[]; // empty = all categories
  applicableProducts?: Types.ObjectId[]; // empty = all products
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Code must be at least 3 characters'],
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Type must be percentage or fixed',
      },
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
      min: [0, 'Value must be greater than or equal to 0'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: null,
      min: 1,
    },
    usesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedByUsers: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: () => new Date(),
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableProducts: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'coupons',
  }
);

// Indexes
couponSchema.index({ isActive: 1, expiryDate: 1 });
couponSchema.index({ createdAt: -1 });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
