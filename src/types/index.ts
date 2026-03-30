import { Types } from 'mongoose';

// User Types
export interface IOAuthProvider {
  provider: 'google' | 'apple';
  providerId: string;
  email?: string;
  profilePicture?: string;
  connectedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  oauthProviders?: IOAuthProvider[];
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProduct {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  category: string;
  badge?: string;
  colors: string[];
  sizes: string[];
  inventory: {
    [key: string]: number; // size-color combination as key
  };
  materials?: string;
  sizeGuide?: string;
  relatedProducts?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: Date;
}

export interface ICart {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

// Favorite Types
export interface IFavorite {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

// Social Post Types
export interface ISocialPost {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  image: string;
  video?: string;
  linkedProducts: Types.ObjectId[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Newsletter Types
export interface INewsletterSubscription {
  _id: Types.ObjectId;
  email: string;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// JWT Token Types
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Request Types
export interface AuthenticatedRequest {
  user: JWTPayload;
}
