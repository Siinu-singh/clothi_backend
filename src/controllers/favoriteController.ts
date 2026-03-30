import { FastifyRequest, FastifyReply } from 'fastify';
import { favoriteService } from '../services/favoriteService.js';
import { addToFavoriteSchema } from '../utils/validators.js';

export class FavoriteController {
  async getFavorites(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { page = '1', limit = '20' } = request.query as {
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const { favorites, pagination } = await favoriteService.getFavorites(
      userId,
      pageNum,
      limitNum
    );

    return reply.code(200).send({
      success: true,
      data: {
        favorites,
        pagination,
      },
    });
  }

  async addToFavorites(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = addToFavoriteSchema.parse(request.body);

    const favorite = await favoriteService.addToFavorites(userId, body.productId);

    return reply.code(201).send({
      success: true,
      data: favorite,
      message: 'Product added to favorites',
    });
  }

  async removeFromFavorites(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { productId } = request.params as { productId: string };

    await favoriteService.removeFromFavorites(userId, productId);

    return reply.code(200).send({
      success: true,
      message: 'Product removed from favorites',
    });
  }

  async isFavorite(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { productId } = request.params as { productId: string };

    const isFav = await favoriteService.isFavorite(userId, productId);

    return reply.code(200).send({
      success: true,
      data: { isFavorite: isFav },
    });
  }
}

export const favoriteController = new FavoriteController();
