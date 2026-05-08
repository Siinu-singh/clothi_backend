import { Schema, model, Types } from 'mongoose';
import { IProduct } from '../types/index.js';

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    oldPrice: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      required: [true, 'Main image is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    badge: {
      type: String,
      enum: ['bestseller', 'new', 'premium'],
      default: null,
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    inventory: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    materials: {
      type: String,
      default: null,
    },
    sizeGuide: {
      type: String,
      default: null,
    },
    relatedProducts: {
      type: [Types.ObjectId],
      ref: 'Product',
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

// Text index for full-text search
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ badge: 1 });

export const Product = model<IProduct>('Product', productSchema);
