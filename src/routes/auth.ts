import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/register', async (request, reply) => {
    try {
      return await authController.register(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      return await authController.login(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/verify-email', async (request, reply) => {
    try {
      return await authController.verifyEmail(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/request-password-reset', async (request, reply) => {
    try {
      return await authController.requestPasswordReset(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/reset-password', async (request, reply) => {
    try {
      return await authController.resetPassword(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/validate-reset-token/:token', async (request, reply) => {
    try {
      return await authController.validateResetToken(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/login/google', async (request, reply) => {
    try {
      return await authController.loginWithGoogle(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/login/apple', async (request, reply) => {
    try {
      return await authController.loginWithApple(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/refresh', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.refreshToken(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // Protected routes
  fastify.get('/profile', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.getProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/resend-verification-email', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.resendVerificationEmail(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/change-password', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.changePassword(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/logout', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.logout(request, reply);
    } catch (error) {
      throw error;
    }
  });

  // OAuth linking routes (Protected - requires authentication)
  fastify.post('/link/google', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.linkGoogleToProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/link/apple', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.linkAppleToProfile(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.delete('/unlink/:provider', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.unlinkOAuthProvider(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/providers', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await authController.getLinkedProviders(request, reply);
    } catch (error) {
      throw error;
    }
  });
}
