import { FastifyRequest, FastifyReply } from 'fastify';
import { announcementService } from '../services/announcementService.js';

export class AnnouncementController {
  /**
   * Get active announcements (public)
   */
  async getActiveAnnouncements(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const announcements = await announcementService.getActiveAnnouncements();
      return reply.send({
        success: true,
        data: announcements,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all announcements (admin)
   */
  async getAllAnnouncements(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string; page?: string };
    try {
      const limit = query.limit ? parseInt(query.limit) : 20;
      const page = query.page ? parseInt(query.page) : 1;
      const result = await announcementService.getAllAnnouncements(limit, page);
      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get announcement by ID (admin)
   */
  async getAnnouncementById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const announcement = await announcementService.getAnnouncementById(id);
      return reply.send({
        success: true,
        data: announcement,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create announcement (admin)
   */
  async createAnnouncement(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    try {
      const announcement = await announcementService.createAnnouncement({
        text: body.text,
        link: body.link,
        isActive: body.isActive,
        order: body.order,
      });
      return reply.code(201).send({
        success: true,
        data: announcement,
        message: 'Announcement created successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update announcement (admin)
   */
  async updateAnnouncement(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const announcement = await announcementService.updateAnnouncement(id, {
        text: body.text,
        link: body.link,
        isActive: body.isActive,
        order: body.order,
      });
      return reply.send({
        success: true,
        data: announcement,
        message: 'Announcement updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete announcement (admin)
   */
  async deleteAnnouncement(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await announcementService.deleteAnnouncement(id);
      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }
}

export const announcementController = new AnnouncementController();
