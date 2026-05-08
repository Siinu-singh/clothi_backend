import { FastifyRequest, FastifyReply } from 'fastify';
import { collectionService } from '../services/collectionService.js';
import {
  collectionQuerySchema,
  collectionSchema,
  collectionUpdateSchema,
  objectIdSchema,
} from '../utils/validators.js';
import { NotFoundError } from '../utils/errors.js';

export class CollectionController {
  /**
   * Get all active collections
   */
  async getAllCollections(request: FastifyRequest, reply: FastifyReply) {
    const query = collectionQuerySchema.parse(request.query);

    const { collections, total, pages } = await collectionService.getAllCollections(
      query.page,
      query.limit,
      {
        search: query.search,
        category: query.category,
        tags: query.tags,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        isFeatured: query.isFeatured,
        sortBy: query.sortBy as any,
        sortOrder: query.sortOrder,
      }
    );

    return reply.code(200).send({
      success: true,
      data: collections,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages,
      },
    });
  }

  /**
   * Get featured collections
   */
  async getFeaturedCollections(request: FastifyRequest, reply: FastifyReply) {
    const { limit = '10' } = request.query as { limit?: string };
    const limitNum = Math.min(20, Math.max(1, parseInt(limit) || 10));

    const collections = await collectionService.getFeaturedCollections(limitNum);

    return reply.code(200).send({
      success: true,
      data: collections,
    });
  }

  /**
   * Get collection by slug
   */
  async getCollectionBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string };

      const collection = await collectionService.getCollectionBySlug(slug);

      return reply.code(200).send({
        success: true,
        data: collection,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search collections
   */
  async searchCollections(request: FastifyRequest, reply: FastifyReply) {
    const { q, page = '1', limit = '20' } = request.query as {
      q: string;
      page?: string;
      limit?: string;
    };

    if (!q) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Search query is required',
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const { collections, total, pages } = await collectionService.searchCollections(
      q,
      pageNum,
      limitNum
    );

    return reply.code(200).send({
      success: true,
      data: collections,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    });
  }

  /**
   * Get collections by category
   */
  async getByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name } = request.params as { name: string };
      const { page = '1', limit = '20' } = request.query as { page?: string; limit?: string };

      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

      const { collections, total, pages } = await collectionService.getByCategory(
        name,
        pageNum,
        limitNum
      );

      return reply.code(200).send({
        success: true,
        data: collections,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get collections by tags
   */
  async getByTags(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tags, page = '1', limit = '20' } = request.query as {
        tags: string;
        page?: string;
        limit?: string;
      };

      if (!tags) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Tags parameter is required',
        });
      }

      const tagsArray = tags.split(',').map((tag) => tag.trim());
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

      const { collections, total, pages } = await collectionService.getByTags(
        tagsArray,
        pageNum,
        limitNum
      );

      return reply.code(200).send({
        success: true,
        data: collections,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create collection (admin)
   */
  async createCollection(request: FastifyRequest, reply: FastifyReply) {
    const body = collectionSchema.parse(request.body);
    const userId = (request.user as any).userId;

    const collection = await collectionService.createCollection(body, userId);

    return reply.code(201).send({
      success: true,
      data: collection,
      message: 'Collection created successfully',
    });
  }

  /**
   * Update collection (admin)
   */
  async updateCollection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const body = collectionUpdateSchema.parse(request.body);

      objectIdSchema.parse(id);

      const collection = await collectionService.updateCollection(id, body);

      return reply.code(200).send({
        success: true,
        data: collection,
        message: 'Collection updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete collection (admin)
   */
  async deleteCollection(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      objectIdSchema.parse(id);

      await collectionService.deleteCollection(id);

      return reply.code(200).send({
        success: true,
        message: 'Collection deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle featured status (admin)
   */
  async toggleFeatured(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      objectIdSchema.parse(id);

      const collection = await collectionService.toggleFeatured(id);

      return reply.code(200).send({
        success: true,
        data: collection,
        message: `Collection ${collection.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle active status (admin)
   */
  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      objectIdSchema.parse(id);

      const collection = await collectionService.toggleActive(id);

      return reply.code(200).send({
        success: true,
        data: collection,
        message: `Collection ${collection.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inventory stats (admin)
   */
  async getInventoryStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const lowStockItems = await collectionService.getLowStockItems();
      const stats = await collectionService.getCollectionStats();

      return reply.code(200).send({
        success: true,
        data: {
          stats,
          lowStockItems,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

export const collectionController = new CollectionController();
