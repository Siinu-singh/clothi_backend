import { FastifyInstance } from 'fastify';
import { addressController } from '../controllers/addressController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function addressRoutes(fastify: FastifyInstance) {
  // Protected routes
  fastify.post('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.createAddress(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.getUserAddresses(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/default', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.getDefaultAddress(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/type/:type', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.getAddressesByType(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.get('/:addressId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.getAddressById(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.patch('/:addressId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.updateAddress(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.delete('/:addressId', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.deleteAddress(request, reply);
    } catch (error) {
      throw error;
    }
  });

  fastify.post('/:addressId/default', { onRequest: [authMiddleware] }, async (request, reply) => {
    try {
      return await addressController.setDefaultAddress(request, reply);
    } catch (error) {
      throw error;
    }
  });
}
