import { FastifyInstance } from 'fastify';
import { addressController } from '../controllers/addressController.js';
import { authMiddleware } from '../middleware/auth.js';

export async function addressRoutes(fastify: FastifyInstance) {
  // Protected routes
  fastify.post('/', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.createAddress(request, reply)
  );

  fastify.get('/', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.getUserAddresses(request, reply)
  );

  fastify.get('/default', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.getDefaultAddress(request, reply)
  );

  fastify.get('/type/:type', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.getAddressesByType(request, reply)
  );

  fastify.get('/:addressId', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.getAddressById(request, reply)
  );

  fastify.patch('/:addressId', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.updateAddress(request, reply)
  );

  fastify.delete('/:addressId', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.deleteAddress(request, reply)
  );

  fastify.post('/:addressId/default', { onRequest: [authMiddleware] }, (request, reply) =>
    addressController.setDefaultAddress(request, reply)
  );
}
