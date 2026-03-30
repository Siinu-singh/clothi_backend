import { FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

export async function adminMiddleware(request: FastifyRequest) {
  try {
    const user = request.user as any;

    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedError('Admin access required');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError('Insufficient permissions');
  }
}
