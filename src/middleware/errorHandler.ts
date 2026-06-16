import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors.js';
import { HTTP_STATUS } from '../config/constants.js';
import { isDevelopment } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Error handler function for use in routes
export async function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  const requestId = request.id;

  // Handle custom app errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      details: error.details,
      requestId,
    });
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: 'Validation Error',
      details: error.errors,
      requestId,
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: 'Validation Error',
      message: error.message,
      details: Object.values(error.errors || {}).map((err: any) => ({
        path: [err.path],
        message: err.message,
      })),
      requestId,
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token',
      requestId,
    });
  }

  // Handle 404 errors
  if (error.statusCode === 404) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      error: 'Not Found',
      message: error.message,
      requestId,
    });
  }

  // Log all 500-level errors for production observability
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  if (statusCode >= 500) {
    logger.error(
      { err: error, requestId, method: request.method, url: request.url },
      'Unhandled server error'
    );
  }

  // Handle all other errors
  return reply.status(statusCode).send({
    success: false,
    error: error.message || 'Internal Server Error',
    requestId,
    ...(isDevelopment && { stack: error.stack }),
  });
}

// Setup error handler for Fastify instance
export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
    await errorHandler(error, request, reply);
  });
}
