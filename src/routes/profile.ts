import { FastifyInstance } from 'fastify';
import { userProfileController } from '../controllers/userProfileController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // Get current user's profile
  fastify.get('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.getProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Update current user's profile
  fastify.patch('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.updateProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get user statistics
  fastify.get('/statistics', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.getUserStatistics(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Update avatar
  fastify.patch('/avatar', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.updateAvatar(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Delete avatar
  fastify.delete('/avatar', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.deleteAvatar(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Delete account
  fastify.delete('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await userProfileController.deleteAccount(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Check email availability (public, no auth required)
  fastify.get('/check-email', async (request, reply) => {
    try {
      return await userProfileController.checkEmailAvailability(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Search for users (public, no auth required)
  fastify.get('/search', async (request, reply) => {
    try {
      return await userProfileController.searchUsers(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Get public profile by user ID
  fastify.get('/:userId', async (request, reply) => {
    try {
      return await userProfileController.getPublicProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });
}
