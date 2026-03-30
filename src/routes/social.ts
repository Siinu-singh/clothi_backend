import { FastifyInstance } from 'fastify';
import { socialController } from '../controllers/socialController.js';
import { requireRole } from '../middleware/auth.js';

export async function socialRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', async (request, reply) => {
    return await socialController.getSocialPosts(request, reply);
  });

  fastify.get('/:id', async (request, reply) => {
    return await socialController.getSocialPostById(request, reply);
  });

  // Admin routes
  fastify.post('/', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await socialController.createSocialPost(request, reply);
  });

  fastify.put('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await socialController.updateSocialPost(request, reply);
  });

  fastify.delete('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await socialController.deleteSocialPost(request, reply);
  });

  fastify.post('/:id/link-products', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await socialController.linkProductsToPost(request, reply);
  });

  fastify.post('/:id/unlink-products', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await socialController.unlinkProductsFromPost(request, reply);
  });
}
