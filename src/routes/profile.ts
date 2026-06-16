import { FastifyInstance } from 'fastify';
import { userProfileController } from '../controllers/userProfileController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Get current user's profile
  fastify.get('/', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.getProfile(request, reply)
  );

  // Update current user's profile
  fastify.patch('/', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.updateProfile(request, reply)
  );

  // Get user statistics
  fastify.get('/statistics', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.getUserStatistics(request, reply)
  );

  // Update avatar
  fastify.patch('/avatar', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.updateAvatar(request, reply)
  );

  // Delete avatar
  fastify.delete('/avatar', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.deleteAvatar(request, reply)
  );

  // Delete account
  fastify.delete('/', { onRequest: [authMiddleware] }, (request, reply) =>
    userProfileController.deleteAccount(request, reply)
  );

  // Check email availability (public, no auth required)
  fastify.get('/check-email', (request, reply) =>
    userProfileController.checkEmailAvailability(request, reply)
  );

  // Search for users (public, no auth required)
  fastify.get('/search', (request, reply) =>
    userProfileController.searchUsers(request, reply)
  );

  // Get public profile by user ID
  fastify.get('/:userId', (request, reply) =>
    userProfileController.getPublicProfile(request, reply)
  );
}
