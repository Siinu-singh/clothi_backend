import { FastifyInstance } from 'fastify';
import { orderController } from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function orderRoutes(fastify: FastifyInstance) {
  // Protected routes - user orders
  fastify.post('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await orderController.createOrder(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await orderController.getUserOrders(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/track/:trackingNumber', async (request, reply) => {
    try {
      return await orderController.trackOrder(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/:orderId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await orderController.getOrderById(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.delete('/:orderId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await orderController.cancelOrder(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Admin routes
  fastify.get(
    '/admin/all',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await orderController.getAllOrders(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  fastify.patch(
    '/admin/:orderId/status',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await orderController.updateOrderStatus(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  fastify.post(
    '/admin/:orderId/tracking',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await orderController.addTrackingNumber(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  fastify.get(
    '/admin/statistics',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await orderController.getOrderStatistics(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );
}
