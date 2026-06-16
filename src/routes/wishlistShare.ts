import { FastifyInstance } from 'fastify';
import { wishlistShareController } from '../controllers/wishlistShareController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function wishlistShareRoutes(fastify: FastifyInstance) {
  // Create a shareable wishlist link (requires auth)
  fastify.post('/', { onRequest: [authMiddleware] }, (request, reply) =>
    wishlistShareController.createShareLink(request, reply)
  );

  // Get user's wishlist share links (requires auth)
  fastify.get('/', { onRequest: [authMiddleware] }, (request, reply) =>
    wishlistShareController.getUserShareLinks(request, reply)
  );

  // Get shared wishlist by token (public)
  fastify.get('/public/:shareToken', (request, reply) =>
    wishlistShareController.getSharedWishlist(request, reply)
  );

  // Revoke a share link (requires auth)
  fastify.patch('/:shareTokenId/revoke', { onRequest: [authMiddleware] }, (request, reply) =>
    wishlistShareController.revokeShareLink(request, reply)
  );

  // Delete a share link (requires auth)
  fastify.delete('/:shareTokenId', { onRequest: [authMiddleware] }, (request, reply) =>
    wishlistShareController.deleteShareLink(request, reply)
  );
}
