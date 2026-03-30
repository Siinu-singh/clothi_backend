import { FastifyInstance } from 'fastify';
import { newsletterController } from '../controllers/newsletterController.js';
import { requireRole } from '../middleware/auth.js';

export async function newsletterRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/subscribe', async (request, reply) => {
    return await newsletterController.subscribe(request, reply);
  });

  fastify.post('/unsubscribe', async (request, reply) => {
    return await newsletterController.unsubscribe(request, reply);
  });

  fastify.get('/check', async (request, reply) => {
    return await newsletterController.checkSubscription(request, reply);
  });

  // Admin routes
  fastify.get('/subscribers/list', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await newsletterController.getSubscribers(request, reply);
  });

  fastify.get('/subscribers/count', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await newsletterController.getSubscriberCount(request, reply);
  });
}
