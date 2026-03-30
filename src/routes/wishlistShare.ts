import { FastifyInstance } from 'fastify';
import { wishlistShareController } from '../controllers/wishlistShareController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function wishlistShareRoutes(fastify: FastifyInstance) {
  // Create a shareable wishlist link (requires auth)
  fastify.post(
    '/',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await wishlistShareController.createShareLink(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get user's wishlist share links (requires auth)
  fastify.get(
    '/',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await wishlistShareController.getUserShareLinks(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get shared wishlist by token (public)
  fastify.get(
    '/public/:shareToken',
    async (request, reply) => {
      try {
        return await wishlistShareController.getSharedWishlist(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Revoke a share link (requires auth)
  fastify.patch(
    '/:shareTokenId/revoke',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await wishlistShareController.revokeShareLink(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );

  // Delete a share link (requires auth)
  fastify.delete(
    '/:shareTokenId',
    { onRequest: [authMiddleware] },
    async (request, reply) => {
      try {
        return await wishlistShareController.deleteShareLink(request, reply);
      } catch (error) {
        throw error;
      }
    }
  );
}
