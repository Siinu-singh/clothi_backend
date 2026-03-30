import { FastifyInstance } from 'fastify';
import { notificationController } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  // Get user's notification preferences (requires auth)
  fastify.get(
    '/preferences',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await notificationController.getPreferences(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Update notification preferences (requires auth)
  fastify.patch(
    '/preferences',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await notificationController.updatePreferences(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get user's email notifications (requires auth)
  fastify.get(
    '/',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await notificationController.getNotifications(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );
}
