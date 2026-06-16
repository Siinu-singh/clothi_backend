import { FastifyInstance } from 'fastify';
import { notificationController } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  // Get user's notification preferences (requires auth)
  fastify.get('/preferences', { onRequest: [authMiddleware] }, (request, reply) =>
    notificationController.getPreferences(request, reply)
  );

  // Update notification preferences (requires auth)
  fastify.patch('/preferences', { onRequest: [authMiddleware] }, (request, reply) =>
    notificationController.updatePreferences(request, reply)
  );

  // Get user's email notifications (requires auth)
  fastify.get('/', { onRequest: [authMiddleware] }, (request, reply) =>
    notificationController.getNotifications(request, reply)
  );
}
