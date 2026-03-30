import { FastifyRequest, FastifyReply } from 'fastify';
import { wishlistShareService } from '../services/wishlistShareService.js';

export class WishlistShareController {
  /**
   * Create a shareable wishlist link
   */
  async createShareLink(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as { expiresIn?: number }; // expiresIn in days

    try {
      const result = await wishlistShareService.createShareLink(userId, body.expiresIn);

      return reply.code(201).send({
        success: true,
        data: result,
        message: 'Wishlist share link created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's wishlist share links
   */
  async getUserShareLinks(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const query = request.query as { limit?: string; page?: string };

    try {
      const limit = query.limit ? parseInt(query.limit) : 10;
      const page = query.page ? parseInt(query.page) : 1;

      const result = await wishlistShareService.getUserShareLinks(userId, limit, page);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get shared wishlist by token (public)
   */
  async getSharedWishlist(request: FastifyRequest, reply: FastifyReply) {
    const { shareToken } = request.params as { shareToken: string };
    const query = request.query as { limit?: string; page?: string };

    try {
      const limit = query.limit ? parseInt(query.limit) : 20;
      const page = query.page ? parseInt(query.page) : 1;

      const result = await wishlistShareService.getSharedWishlist(shareToken, limit, page);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disable/revoke a share link
   */
  async revokeShareLink(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { shareTokenId } = request.params as { shareTokenId: string };

    try {
      const result = await wishlistShareService.revokeShareLink(shareTokenId, userId);

      return reply.send({
        success: true,
        data: result,
        message: 'Share link revoked successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a share link
   */
  async deleteShareLink(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { shareTokenId } = request.params as { shareTokenId: string };

    try {
      await wishlistShareService.deleteShareLink(shareTokenId, userId);

      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }
}

export const wishlistShareController = new WishlistShareController();
