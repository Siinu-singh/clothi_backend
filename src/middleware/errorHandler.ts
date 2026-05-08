import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors.js';
import { HTTP_STATUS } from '../config/constants.js';

// Error handler function for use in routes
export async function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  // Handle custom app errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      details: error.details,
    });
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      success: false,
      error: 'Validation Error',
      details: error.errors,
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
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token',
    });
  }

  // Handle 404 errors
  if (error.statusCode === 404) {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      success: false,
      error: 'Not Found',
      message: error.message,
    });
  }

  // Handle all other errors
  return reply.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

// Setup error handler for Fastify instance
export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: any, request: FastifyRequest, reply: FastifyReply) => {
    await errorHandler(error, request, reply);
  });
}
