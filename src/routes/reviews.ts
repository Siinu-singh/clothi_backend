import { FastifyInstance } from 'fastify';
import { reviewController } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  // Create review (requires auth)
  fastify.post('/:productId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.createReview(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get reviews for a product (public)
  fastify.get('/:productId', async (request, reply) => {
    try {
      return await reviewController.getProductReviews(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get user's reviews (requires auth)
  fastify.get('/user/my-reviews', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.getUserReviews(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get single review (public)
  fastify.get('/detail/:reviewId', async (request, reply) => {
    try {
      return await reviewController.getReviewById(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Update review (requires auth)
  fastify.patch('/:reviewId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.updateReview(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Delete review (requires auth)
  fastify.delete('/:reviewId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.deleteReview(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Mark review as helpful (public)
  fastify.post('/:reviewId/helpful', async (request, reply) => {
    try {
      return await reviewController.markHelpful(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Admin routes
  fastify.post('/:reviewId/approve', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.approveReview(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/:reviewId/reject', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.rejectReview(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/admin/pending', { onRequest: [authMiddleware, adminMiddleware] }, async (request, reply) => {
    try {
      return await reviewController.getPendingReviews(request, reply);
    } catch (error) {
      throw error;
    }
  });
}
