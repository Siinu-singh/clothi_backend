import { FastifyRequest, FastifyReply } from 'fastify';
import { socialService } from '../services/socialService.js';

export class SocialController {
  async getSocialPosts(request: FastifyRequest, reply: FastifyReply) {
    const { page = '1', limit = '10' } = request.query as {
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));

    const { posts, pagination } = await socialService.getSocialPosts(
      pageNum,
      limitNum
    );

    return reply.code(200).send({
      success: true,
      data: {
        posts,
        pagination,
      },
    });
  }

  async getSocialPostById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const post = await socialService.getSocialPostById(id);

    return reply.code(200).send({
      success: true,
      data: post,
    });
  }

  async createSocialPost(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;

    // Validate required fields
    if (!body.title || !body.image) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Title and image are required',
      });
    }

    const post = await socialService.createSocialPost(body);

    return reply.code(201).send({
      success: true,
      data: post,
      message: 'Social post created successfully',
    });
  }

  async updateSocialPost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const post = await socialService.updateSocialPost(id, body);

    return reply.code(200).send({
      success: true,
      data: post,
      message: 'Social post updated successfully',
    });
  }

  async deleteSocialPost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    await socialService.deleteSocialPost(id);

    return reply.code(200).send({
      success: true,
      message: 'Social post deleted successfully',
    });
  }

  async linkProductsToPost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { productIds } = request.body as { productIds: string[] };

    if (!productIds || !Array.isArray(productIds)) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Product IDs array is required',
      });
    }

    const post = await socialService.linkProductsToPost(id, productIds);

    return reply.code(200).send({
      success: true,
      data: post,
      message: 'Products linked to post successfully',
    });
  }

  async unlinkProductsFromPost(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { productIds } = request.body as { productIds: string[] };

    if (!productIds || !Array.isArray(productIds)) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Product IDs array is required',
      });
    }

    const post = await socialService.unlinkProductsFromPost(id, productIds);

    return reply.code(200).send({
      success: true,
      data: post,
      message: 'Products unlinked from post successfully',
    });
  }
}

export const socialController = new SocialController();
