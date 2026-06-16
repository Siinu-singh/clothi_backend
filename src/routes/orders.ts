import { FastifyInstance } from 'fastify';
import { orderController } from '../controllers/orderController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export async function orderRoutes(fastify: FastifyInstance) {
  // Protected routes - user orders
  fastify.post('/', { onRequest: [authMiddleware] }, (request, reply) =>
    orderController.createOrder(request, reply)
  );

  fastify.get('/', { onRequest: [authMiddleware] }, (request, reply) =>
    orderController.getUserOrders(request, reply)
  );

  fastify.get('/track/:trackingNumber', (request, reply) =>
    orderController.trackOrder(request, reply)
  );

  fastify.get('/:orderId', { onRequest: [authMiddleware] }, (request, reply) =>
    orderController.getOrderById(request, reply)
  );

  fastify.delete('/:orderId', { onRequest: [authMiddleware] }, (request, reply) =>
    orderController.cancelOrder(request, reply)
  );

  // Admin routes — requireRole includes auth check
  fastify.get('/admin/all', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    orderController.getAllOrders(request, reply)
  );

  fastify.patch('/admin/:orderId/status', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    orderController.updateOrderStatus(request, reply)
  );

  fastify.post('/admin/:orderId/tracking', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    orderController.addTrackingNumber(request, reply)
  );

  fastify.get('/admin/statistics', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    orderController.getOrderStatistics(request, reply)
  );
}
