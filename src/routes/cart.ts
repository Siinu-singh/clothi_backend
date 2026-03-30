import { FastifyInstance } from 'fastify';
import { cartController } from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function cartRoutes(fastify: FastifyInstance) {
  // All cart routes require authentication
  fastify.get('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await cartController.getCart(request, reply);
  });

  fastify.post('/add', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await cartController.addToCart(request, reply);
  });

  fastify.delete('/:itemId', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await cartController.removeFromCart(request, reply);
  });

  fastify.put('/:itemId', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await cartController.updateCartItem(request, reply);
  });

  fastify.delete('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    return await cartController.clearCart(request, reply);
  });
}
