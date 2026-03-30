import { FastifyRequest, FastifyReply } from 'fastify';
import { emailService } from '../services/emailService.js';

export class NotificationController {
  /**
   * Get user's notification preferences
   */
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const preferences = await emailService.getNotificationPreferences(userId);

      return reply.send({
        success: true,
        data: preferences,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const updated = await emailService.updateNotificationPreferences(userId, body);

      return reply.send({
        success: true,
        data: updated,
        message: 'Notification preferences updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's email notifications
   */
  async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const query = request.query as { limit?: string; page?: string };

    try {
      const limit = query.limit ? parseInt(query.limit) : 20;
      const page = query.page ? parseInt(query.page) : 1;

      const result = await emailService.getUserNotifications(userId, limit, page);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      throw error;
    }
  }
}

export const notificationController = new NotificationController();
