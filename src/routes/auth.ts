import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/register', (request, reply) =>
    authController.register(request, reply)
  );

  fastify.post('/login', (request, reply) =>
    authController.login(request, reply)
  );

  fastify.post('/verify-email', (request, reply) =>
    authController.verifyEmail(request, reply)
  );

  fastify.post('/request-password-reset', (request, reply) =>
    authController.requestPasswordReset(request, reply)
  );

  fastify.post('/reset-password', (request, reply) =>
    authController.resetPassword(request, reply)
  );

  fastify.get('/validate-reset-token/:token', (request, reply) =>
    authController.validateResetToken(request, reply)
  );

  fastify.post('/login/google', (request, reply) =>
    authController.loginWithGoogle(request, reply)
  );

  fastify.post('/login/apple', (request, reply) =>
    authController.loginWithApple(request, reply)
  );

  fastify.post('/refresh', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.refreshToken(request, reply)
  );

  // Protected routes
  fastify.get('/profile', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.getProfile(request, reply)
  );

  fastify.post('/resend-verification-email', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.resendVerificationEmail(request, reply)
  );

  fastify.post('/change-password', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.changePassword(request, reply)
  );

  fastify.post('/logout', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.logout(request, reply)
  );

  // OAuth linking routes (Protected - requires authentication)
  fastify.post('/link/google', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.linkGoogleToProfile(request, reply)
  );

  fastify.post('/link/apple', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.linkAppleToProfile(request, reply)
  );

  fastify.delete('/unlink/:provider', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.unlinkOAuthProvider(request, reply)
  );

  fastify.get('/providers', { onRequest: [authMiddleware] }, (request, reply) =>
    authController.getLinkedProviders(request, reply)
  );
}
