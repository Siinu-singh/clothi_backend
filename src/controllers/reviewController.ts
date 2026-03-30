import { FastifyRequest, FastifyReply } from 'fastify';
import { reviewService, GetReviewsOptions } from '../services/reviewService.js';

export class ReviewController {
  /**
   * Create a review
   */
  async createReview(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { productId } = request.params as { productId: string };
    const body = request.body as any;

    try {
      const review = await reviewService.createReview(productId, userId, {
        rating: body.rating,
        title: body.title,
        comment: body.comment,
      });

      return reply.code(201).send({
        success: true,
        data: { review },
        message: 'Review created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const query = request.query as {
      status?: string;
      sortBy?: string;
      limit?: string;
      page?: string;
    };

    try {
      const options: GetReviewsOptions = {
        status: (query.status as any) || 'approved',
        sortBy: (query.sortBy as any) || 'recent',
        limit: query.limit ? parseInt(query.limit) : 10,
        page: query.page ? parseInt(query.page) : 1,
      };

      const result = await reviewService.getProductReviews(productId, options);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const query = request.query as { limit?: string; page?: string };

    try {
      const limit = query.limit ? parseInt(query.limit) : 10;
      const page = query.page ? parseInt(query.page) : 1;

      const result = await reviewService.getUserReviews(userId, limit, page);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single review
   */
  async getReviewById(request: FastifyRequest, reply: FastifyReply) {
    const { reviewId } = request.params as { reviewId: string };

    try {
      const review = await reviewService.getReviewById(reviewId);

      return reply.send({
        success: true,
        data: { review },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { reviewId } = request.params as { reviewId: string };
    const body = request.body as any;

    try {
      const review = await reviewService.updateReview(reviewId, userId, {
        rating: body.rating,
        title: body.title,
        comment: body.comment,
      });

      return reply.send({
        success: true,
        data: { review },
        message: 'Review updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { reviewId } = request.params as { reviewId: string };

    try {
      await reviewService.deleteReview(reviewId, userId);

      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(request: FastifyRequest, reply: FastifyReply) {
    const { reviewId } = request.params as { reviewId: string };
    const { helpful } = request.body as { helpful: boolean };

    try {
      const review = await reviewService.markReviewHelpful(reviewId, helpful);

      return reply.send({
        success: true,
        data: { review },
        message: helpful ? 'Marked as helpful' : 'Marked as unhelpful',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve review (admin)
   */
  async approveReview(request: FastifyRequest, reply: FastifyReply) {
    const { reviewId } = request.params as { reviewId: string };

    try {
      const review = await reviewService.approveReview(reviewId);

      return reply.send({
        success: true,
        data: { review },
        message: 'Review approved successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject review (admin)
   */
  async rejectReview(request: FastifyRequest, reply: FastifyReply) {
    const { reviewId } = request.params as { reviewId: string };

    try {
      const review = await reviewService.rejectReview(reviewId);

      return reply.send({
        success: true,
        data: { review },
        message: 'Review rejected successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending reviews (admin)
   */
  async getPendingReviews(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string; page?: string };

    try {
      const limit = query.limit ? parseInt(query.limit) : 10;
      const page = query.page ? parseInt(query.page) : 1;

      const result = await reviewService.getPendingReviews(limit, page);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const reviewController = new ReviewController();
