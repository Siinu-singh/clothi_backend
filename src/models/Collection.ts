import { Schema, model, Types } from 'mongoose';
import { ICollection } from '../types/index.js';

const collectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      unique: true,
      index: 'text',
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
      index: 'text',
    },
    images: [
      {
        url: {
          type: String,
          required: [true, 'Image URL is required'],
        },
        alt: {
          type: String,
          default: null,
        },
        isMain: {
          type: Boolean,
          default: false,
        },
        order: {
          type: Number,
          default: 0,
        },
        _id: false,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price must be positive'],
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Discount type must be either percentage or fixed',
      },
      default: null,
    },
    discountValue: {
      type: Number,
      default: null,
      min: [0, 'Discount value must be positive'],
    },
    finalPrice: {
      type: Number,
      required: [true, 'Final price is required'],
      min: [0, 'Price must be positive'],
    },
    discountStartDate: {
      type: Date,
      default: null,
    },
    discountEndDate: {
      type: Date,
      default: null,
    },
    totalStock: {
      type: Number,
      required: [true, 'Total stock is required'],
      min: [0, 'Stock must be non-negative'],
    },
    availableStock: {
      type: Number,
      required: [true, 'Available stock is required'],
      min: [0, 'Stock must be non-negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Threshold must be non-negative'],
    },
    seoTitle: {
      type: String,
      default: null,
    },
    seoDescription: {
      type: String,
      default: null,
    },
    seoKeywords: {
      type: [String],
      default: [],
      index: 'text',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: 1,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'collections',
  }
);

// Compound index for featured + active collections
collectionSchema.index({ isFeatured: 1, isActive: 1 });

// Index for filtering
collectionSchema.index({ category: 1 });
collectionSchema.index({ tags: 1 });

// Index for sorting
collectionSchema.index({ price: 1 });
collectionSchema.index({ createdAt: -1 });

// Text search indexes
collectionSchema.index({ name: 'text', description: 'text', seoKeywords: 'text' });

// Index for inventory alerts
collectionSchema.index({ availableStock: 1, lowStockThreshold: 1 });


export const Collection = model<ICollection>('Collection', collectionSchema);
