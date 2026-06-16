import { FastifyInstance } from 'fastify';
import { couponController } from '../controllers/couponController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export async function couponRoutes(fastify: FastifyInstance) {
  // Create coupon (admin only)
  fastify.post('/', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    couponController.createCoupon(request, reply)
  );

  // Get all coupons (admin only)
  fastify.get('/', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    couponController.getAllCoupons(request, reply)
  );

  // Get coupon by ID (admin only)
  fastify.get('/:couponId', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    couponController.getCouponById(request, reply)
  );

  // Validate coupon (requires auth)
  fastify.post('/validate', { onRequest: [authMiddleware] }, (request, reply) =>
    couponController.validateCoupon(request, reply)
  );

  // Update coupon (admin only)
  fastify.patch('/:couponId', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    couponController.updateCoupon(request, reply)
  );

  // Delete coupon (admin only)
  fastify.delete('/:couponId', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    couponController.deleteCoupon(request, reply)
  );

  // Get coupons by product (public)
  fastify.get('/product/:productId', (request, reply) =>
    couponController.getCouponsByProduct(request, reply)
  );

  // Get coupons by category (public)
  fastify.get('/category/:category', (request, reply) =>
    couponController.getCouponsByCategory(request, reply)
  );
}
