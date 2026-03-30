import { z } from 'zod';
import { Types } from 'mongoose';

// MongoDB ObjectId validator
export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
};

// Zod schema for MongoDB ObjectId
export const objectIdSchema = z.string().refine(
  (val) => isValidObjectId(val),
  { message: 'Invalid ID format' }
);

// Auth Validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Product Validators
export const productQuerySchema = z.object({
  page: z.string().default('1').transform(Number).pipe(z.number().min(1)),
  limit: z.string().default('20').transform(Number).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform((val) => val ? Number(val) : undefined),
  sortBy: z.enum(['price', 'newest', 'popular']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  oldPrice: z.number().optional(),
  image: z.string().url('Invalid image URL'),
  images: z.array(z.string().url()).optional(),
  category: z.string().min(1, 'Category is required'),
  badge: z.enum(['NEW', 'SALE', 'FEATURED', 'LIMITED']).optional(),
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  inventory: z.record(z.number()).optional(),
  materials: z.string().optional(),
  sizeGuide: z.string().optional(),
});

// Cart Validators
export const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100),
});

// Favorite Validators
export const addToFavoriteSchema = z.object({
  productId: objectIdSchema,
});

// Newsletter Validators
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Pagination Validators
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});
