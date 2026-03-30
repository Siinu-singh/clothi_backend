import { FastifyInstance } from 'fastify';
import { couponController } from '../controllers/couponController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

export async function couponRoutes(fastify: FastifyInstance) {
  // Create coupon (admin only)
  fastify.post('/', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await couponController.createCoupon(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get all coupons (admin only)
  fastify.get('/', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await couponController.getAllCoupons(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get coupon by ID (admin only)
  fastify.get('/:couponId', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await couponController.getCouponById(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Validate coupon (requires auth)
  fastify.post('/validate', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await couponController.validateCoupon(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Update coupon (admin only)
  fastify.patch('/:couponId', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await couponController.updateCoupon(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Delete coupon (admin only)
  fastify.delete('/:couponId', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await couponController.deleteCoupon(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get coupons by product (public)
  fastify.get('/product/:productId', async (request, reply) => {
    try {
      return await couponController.getCouponsByProduct(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get coupons by category (public)
  fastify.get('/category/:category', async (request, reply) => {
    try {
      return await couponController.getCouponsByCategory(request, reply);
    } catch (error) {
      throw error;
    }
  });
}
