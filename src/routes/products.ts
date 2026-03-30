import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/productController.js';
import { requireRole } from '../middleware/auth.js';

export async function productRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', async (request, reply) => {
    return await productController.getAllProducts(request, reply);
  });

  fastify.get('/search', async (request, reply) => {
    return await productController.searchProducts(request, reply);
  });

  fastify.get('/:id', async (request, reply) => {
    return await productController.getProductById(request, reply);
  });

  fastify.get('/:id/related', async (request, reply) => {
    return await productController.getRelatedProducts(request, reply);
  });

  // Admin routes
  fastify.post('/', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await productController.createProduct(request, reply);
  });

  fastify.put('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await productController.updateProduct(request, reply);
  });

  fastify.delete('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await productController.deleteProduct(request, reply);
  });
}
