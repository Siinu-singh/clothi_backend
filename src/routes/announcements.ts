import { FastifyInstance } from 'fastify';
import { announcementController } from '../controllers/announcementController.js';
import { requireRole } from '../middleware/auth.js';

export async function announcementRoutes(fastify: FastifyInstance) {
  // ── Public ────────────────────────────────────────────
  // Get active announcements (no auth required)
  fastify.get('/', async (request, reply) => {
    return announcementController.getActiveAnnouncements(request, reply);
  });

  // ── Admin Only ────────────────────────────────────────
  // Get all announcements (admin)
  fastify.get('/admin', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return announcementController.getAllAnnouncements(request, reply);
  });

  // Get announcement by ID (admin)
  fastify.get('/admin/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return announcementController.getAnnouncementById(request, reply);
  });

  // Create announcement (admin)
  fastify.post('/', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return announcementController.createAnnouncement(request, reply);
  });

  // Update announcement (admin)
  fastify.put('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return announcementController.updateAnnouncement(request, reply);
  });

  // Delete announcement (admin)
  fastify.delete('/:id', { onRequest: [requireRole(['admin'])] }, async (request, reply) => {
    return announcementController.deleteAnnouncement(request, reply);
  });
}
