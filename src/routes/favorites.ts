import { FastifyInstance } from 'fastify';
import { favoriteController } from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function favoriteRoutes(fastify: FastifyInstance) {
  // All favorite routes require authentication
  fastify.get('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await favoriteController.getFavorites(request, reply);
  });

  fastify.post('/add', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await favoriteController.addToFavorites(request, reply);
  });

  fastify.delete('/:productId', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await favoriteController.removeFromFavorites(request, reply);
  });

  fastify.get('/:productId/check', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await favoriteController.isFavorite(request, reply);
  });
}
