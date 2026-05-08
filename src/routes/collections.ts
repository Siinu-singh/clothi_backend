import { FastifyInstance } from 'fastify';
import { collectionController } from '../controllers/collectionController.js';
import { requireRole } from '../middleware/auth.js';

export async function collectionRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', async (request, reply) => {
    return await collectionController.getAllCollections(request, reply);
  });

  fastify.get('/featured', async (request, reply) => {
    return await collectionController.getFeaturedCollections(request, reply);
  });

  fastify.get('/search', async (request, reply) => {
    return await collectionController.searchCollections(request, reply);
  });

  fastify.get('/category/:name', async (request, reply) => {
    return await collectionController.getByCategory(request, reply);
  });

  fastify.get('/tags', async (request, reply) => {
    return await collectionController.getByTags(request, reply);
  });

  fastify.get('/:slug', async (request, reply) => {
    return await collectionController.getCollectionBySlug(request, reply);
  });

  // Admin routes
  fastify.post('/', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.createCollection(request, reply);
  });

  fastify.put('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.updateCollection(request, reply);
  });

  fastify.delete('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.deleteCollection(request, reply);
  });

  fastify.patch('/:id/featured', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.toggleFeatured(request, reply);
  });

  fastify.patch('/:id/active', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.toggleActive(request, reply);
  });

  fastify.get('/admin/stats', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return await collectionController.getInventoryStats(request, reply);
  });
}
