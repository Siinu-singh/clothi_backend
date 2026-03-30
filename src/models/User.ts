import { Schema, model } from 'mongoose';
import { IUser } from '../types/index.js';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: false, // Optional for OAuth users (Google, Apple)
      validate: {
        validator: function(v: string | undefined) {
          // If password is provided, it must be at least 8 characters
          // If password is empty or undefined (OAuth user), validation passes
          if (!v) return true; // Allow empty/undefined for OAuth users
          return v.length >= 8; // Otherwise must be 8+ chars
        },
        message: 'Password must be at least 8 characters'
      },
      select: false, // Don't include password by default in queries
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    oauthProviders: {
      type: [{
        provider: {
          type: String,
          enum: ['google', 'apple'],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          default: null,
        },
        profilePicture: {
          type: String,
          default: null,
        },
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Index for faster queries
// Note: email index is already created by 'unique: true' on the field
userSchema.index({ createdAt: -1 });

export const User = model<IUser>('User', userSchema);
