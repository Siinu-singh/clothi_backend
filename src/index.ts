import Fastify from 'fastify';
import mongoose from 'mongoose';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCompress from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { setupSwagger } from './config/swagger.js';
import { logger } from './utils/logger.js';
import { setupErrorHandler } from './middleware/errorHandler.js';

// Route imports
import { authRoutes } from './routes/auth.js';
import { productRoutes } from './routes/products.js';
import { cartRoutes } from './routes/cart.js';
import { favoriteRoutes } from './routes/favorites.js';
import { socialRoutes } from './routes/social.js';
import { newsletterRoutes } from './routes/newsletter.js';
import { orderRoutes } from './routes/orders.js';
import { addressRoutes } from './routes/addresses.js';
import { profileRoutes } from './routes/profile.js';
import { reviewRoutes } from './routes/reviews.js';
import { couponRoutes } from './routes/coupons.js';
import { wishlistShareRoutes } from './routes/wishlistShare.js';
import { notificationRoutes } from './routes/notifications.js';
import { collectionRoutes } from './routes/collections.js';
import { announcementRoutes } from './routes/announcements.js';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: env.LOG_LEVEL,
  },
});

async function startServer() {
  try {
    // Connect to database
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('Database connected successfully');

    // Register plugins
    logger.info('Registering Fastify plugins...');

    // Security
    await fastify.register(fastifyHelmet, {
      contentSecurityPolicy: false,
    });

    // CORS
    await fastify.register(fastifyCors, {
      origin: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Cookie support
    await fastify.register(fastifyCookie);

    // JWT
    await fastify.register(fastifyJwt, {
      secret: env.JWT_SECRET,
    });

    // Rate limiting
    await fastify.register(fastifyRateLimit, {
      max: env.RATE_LIMIT_MAX,
      timeWindow: `${env.RATE_LIMIT_WINDOW_MS}ms`,
      allowList: (req: any) => {
        const ip = req.ip || '';
        return ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1') || ip.includes('localhost') || ip.includes('::1');
      }
    });

    // Compression
    await fastify.register(fastifyCompress);

    // Multipart for CSV uploads
    await fastify.register(fastifyMultipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    });

    // Setup error handler
    setupErrorHandler(fastify);

    // Setup Swagger documentation
    logger.info('Setting up Swagger documentation...');
    await setupSwagger(fastify);

    // Register routes
    logger.info('Registering routes...');

    // Health check — deep check with DB ping
    fastify.get('/health', async (_request, reply) => {
      const dbState = mongoose.connection.readyState;
      const isDbHealthy = dbState === 1;
      const statusCode = isDbHealthy ? 200 : 503;

      return reply.code(statusCode).send({
        success: isDbHealthy,
        message: isDbHealthy ? 'Server is healthy' : 'Database unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: isDbHealthy ? 'connected' : 'disconnected',
      });
    });

    // API routes with prefix
    fastify.register(authRoutes, { prefix: '/api/auth' });
    fastify.register(productRoutes, { prefix: '/api/products' });
    fastify.register(cartRoutes, { prefix: '/api/cart' });
    fastify.register(favoriteRoutes, { prefix: '/api/favorites' });
    fastify.register(socialRoutes, { prefix: '/api/social' });
    fastify.register(newsletterRoutes, { prefix: '/api/newsletter' });
    fastify.register(orderRoutes, { prefix: '/api/orders' });
    fastify.register(addressRoutes, { prefix: '/api/addresses' });
    fastify.register(profileRoutes, { prefix: '/api/profile' });
    fastify.register(reviewRoutes, { prefix: '/api/reviews' });
    fastify.register(couponRoutes, { prefix: '/api/coupons' });
    fastify.register(wishlistShareRoutes, { prefix: '/api/wishlist-share' });
    fastify.register(notificationRoutes, { prefix: '/api/notifications' });
    fastify.register(collectionRoutes, { prefix: '/api/collections' });
    fastify.register(announcementRoutes, { prefix: '/api/announcements' });

    // 404 handler
    fastify.setNotFoundHandler((_request, reply) => {
      return reply.status(404).send({
        success: false,
        error: 'Not Found',
        message: `Route not found`,
      });
    });

    // Start server
    const port = env.PORT;
    const host = '0.0.0.0';

    await fastify.listen({ port, host });
    logger.info(`Server is running at http://${host}:${port}`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      try {
        await fastify.close();
        logger.info('Fastify server closed');
        
        await disconnectDatabase();
        logger.info('Database disconnected');
        
        process.exit(0);
      } catch (error) {
        logger.error(error, 'Error during graceful shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Process-level safety nets
    process.on('unhandledRejection', (reason) => {
      logger.error({ err: reason }, 'Unhandled promise rejection');
    });
    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Uncaught exception — shutting down');
      process.exit(1);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  logger.error(error, 'Unexpected error during startup');
  process.exit(1);
});
