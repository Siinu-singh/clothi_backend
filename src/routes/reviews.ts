import { FastifyInstance } from 'fastify';
import { reviewController } from '../controllers/reviewController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  // Create review (requires auth)
  fastify.post('/:productId', { onRequest: [authMiddleware] }, (request, reply) =>
    reviewController.createReview(request, reply)
  );

  // Get reviews for a product (public)
  fastify.get('/:productId', (request, reply) =>
    reviewController.getProductReviews(request, reply)
  );

  // Get user's reviews (requires auth)
  fastify.get('/user/my-reviews', { onRequest: [authMiddleware] }, (request, reply) =>
    reviewController.getUserReviews(request, reply)
  );

  // Get single review (public)
  fastify.get('/detail/:reviewId', (request, reply) =>
    reviewController.getReviewById(request, reply)
  );

  // Update review (requires auth)
  fastify.patch('/:reviewId', { onRequest: [authMiddleware] }, (request, reply) =>
    reviewController.updateReview(request, reply)
  );

  // Delete review (requires auth)
  fastify.delete('/:reviewId', { onRequest: [authMiddleware] }, (request, reply) =>
    reviewController.deleteReview(request, reply)
  );

  // Mark review as helpful (public)
  fastify.post('/:reviewId/helpful', (request, reply) =>
    reviewController.markHelpful(request, reply)
  );

  // Admin routes — requireRole includes auth check
  fastify.post('/:reviewId/approve', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    reviewController.approveReview(request, reply)
  );

  fastify.post('/:reviewId/reject', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    reviewController.rejectReview(request, reply)
  );

  fastify.get('/admin/pending', { onRequest: [requireRole(['admin'])] }, (request, reply) =>
    reviewController.getPendingReviews(request, reply)
  );
}
