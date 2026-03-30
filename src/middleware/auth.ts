import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(
  request: FastifyRequest
) {
  try {
    // Fastify JWT plugin automatically decodes and validates
    await request.jwtVerify();
  } catch (error) {
    throw new UnauthorizedError('Invalid or missing token');
  }
}

export async function optionalAuthMiddleware(
  request: FastifyRequest
) {
  try {
    await request.jwtVerify();
  } catch {
    // Optional auth, so we don't throw - just continue without user
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
      const user = request.user as any;
      
      if (!allowedRoles.includes(user.role)) {
        throw new UnauthorizedError('Insufficient permissions');
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or missing token');
    }
  };
}
