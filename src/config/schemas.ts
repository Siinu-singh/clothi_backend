import { FastifyInstance } from 'fastify';

/**
 * API Documentation - Detailed endpoint schemas
 * This file contains all the Swagger/OpenAPI schemas for API documentation
 */

export const reviewSchemas = {
  CreateReview: {
    description: 'Create a new product review',
    tags: ['Reviews'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: { type: 'string', description: 'Product ID' },
      },
    },
    body: {
      type: 'object',
      required: ['rating', 'comment'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5 },
        title: { type: 'string', maxLength: 100 },
        comment: { type: 'string', minLength: 10, maxLength: 1000 },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              review: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  productId: { type: 'string' },
                  userId: { type: 'string' },
                  rating: { type: 'number' },
                  title: { type: 'string' },
                  comment: { type: 'string' },
                  verifiedPurchase: { type: 'boolean' },
                  status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                  helpful: { type: 'number' },
                  unhelpful: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          message: { type: 'string' },
        },
      },
    },
  },

  GetProductReviews: {
    description: 'Get all reviews for a product with statistics',
    tags: ['Reviews'],
    params: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: { type: 'string' },
      },
    },
    querystring: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['approved', 'pending', 'rejected'] },
        sortBy: { type: 'string', enum: ['recent', 'rating', 'helpful'] },
        limit: { type: 'number', default: 10 },
        page: { type: 'number', default: 1 },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              reviews: { type: 'array' },
              pagination: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  pages: { type: 'number' },
                },
              },
              stats: {
                type: 'object',
                properties: {
                  averageRating: { type: 'number' },
                  totalReviews: { type: 'number' },
                  ratingDistribution: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const couponSchemas = {
  CreateCoupon: {
    description: 'Create a new coupon (Admin only)',
    tags: ['Coupons'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['code', 'type', 'value', 'expiryDate'],
      properties: {
        code: { type: 'string', minLength: 3, maxLength: 20 },
        type: { type: 'string', enum: ['percentage', 'fixed'] },
        value: { type: 'number', minimum: 0 },
        maxDiscount: { type: 'number', minimum: 0 },
        minPurchaseAmount: { type: 'number', default: 0 },
        maxUses: { type: 'number', minimum: 1 },
        maxUsesPerUser: { type: 'number', default: 1 },
        startDate: { type: 'string', format: 'date-time' },
        expiryDate: { type: 'string', format: 'date-time' },
        applicableCategories: { type: 'array', items: { type: 'string' } },
        applicableProducts: { type: 'array', items: { type: 'string' } },
        description: { type: 'string', maxLength: 500 },
      },
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              coupon: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  code: { type: 'string' },
                  type: { type: 'string' },
                  value: { type: 'number' },
                  isActive: { type: 'boolean' },
                  expiryDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          message: { type: 'string' },
        },
      },
    },
  },

  ValidateCoupon: {
    description: 'Validate a coupon code',
    tags: ['Coupons'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      required: ['code', 'subtotal'],
      properties: {
        code: { type: 'string' },
        subtotal: { type: 'number', minimum: 0 },
        cartItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              category: { type: 'string' },
            },
          },
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              discount: { type: 'number' },
              message: { type: 'string' },
              coupon: { type: 'object' },
            },
          },
        },
      },
    },
  },
};

export function attachSchemas(fastify: FastifyInstance) {
  // Review routes with schemas
  fastify.post<{ Params: { productId: string } }>(
    '/api/reviews/:productId',
    {
      schema: reviewSchemas.CreateReview,
    },
    async () => {}
  );

  fastify.get<{ Params: { productId: string } }>(
    '/api/reviews/:productId',
    {
      schema: reviewSchemas.GetProductReviews,
    },
    async () => {}
  );

  // Coupon routes with schemas
  fastify.post(
    '/api/coupons',
    {
      schema: couponSchemas.CreateCoupon,
    },
    async () => {}
  );

  fastify.post(
    '/api/coupons/validate',
    {
      schema: couponSchemas.ValidateCoupon,
    },
    async () => {}
  );
}
