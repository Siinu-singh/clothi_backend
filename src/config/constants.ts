// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email is already registered',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',

  // Product
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCTS_NOT_FOUND: 'No products found',

  // Cart
  CART_EMPTY: 'Cart is empty',
  INVALID_QUANTITY: 'Invalid quantity',
  OUT_OF_STOCK: 'Product is out of stock',
  CART_ITEM_NOT_FOUND: 'Item not found in cart',

  // Favorite
  FAVORITE_NOT_FOUND: 'Item not in favorites',
  ALREADY_FAVORITE: 'Item is already in favorites',

  // General
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
} as const;

// Database
export const MONGODB_COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CARTS: 'carts',
  FAVORITES: 'favorites',
  SOCIAL_POSTS: 'social_posts',
  NEWSLETTER: 'newsletter_subscriptions',
  ORDERS: 'orders',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Product
export const PRODUCT_BADGES = ['NEW', 'SALE', 'FEATURED', 'LIMITED'] as const;
export const PRODUCT_CATEGORIES = [
  'Men',
  'Women',
  'Accessories',
  'Footwear',
] as const;

// User Roles
export const USER_ROLES = ['customer', 'admin'] as const;
