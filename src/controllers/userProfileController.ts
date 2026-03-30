import { FastifyRequest, FastifyReply } from 'fastify';
import { userProfileService } from '../services/userProfileService.js';

export class UserProfileController {
  /**
   * Get current user's profile
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const profile = await userProfileService.getProfile(userId);

      return reply.send({
        success: true,
        data: { profile },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get public profile by user ID
   */
  async getPublicProfile(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.params as { userId: string };

    try {
      const profile = await userProfileService.getPublicProfile(userId);

      return reply.send({
        success: true,
        data: { profile },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const updatedProfile = await userProfileService.updateProfile(userId, {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        avatar: body.avatar,
        phone: body.phone,
      });

      return reply.send({
        success: true,
        data: { profile: updatedProfile },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      const updatedProfile = await userProfileService.updateAvatar(
        userId,
        body.avatarUrl
      );

      return reply.send({
        success: true,
        data: { profile: updatedProfile },
        message: 'Avatar updated successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const updatedProfile = await userProfileService.deleteAvatar(userId);

      return reply.send({
        success: true,
        data: { profile: updatedProfile },
        message: 'Avatar deleted successfully',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile statistics
   */
  async getUserStatistics(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    try {
      const statistics = await userProfileService.getUserStatistics(userId);

      return reply.send({
        success: true,
        data: { statistics },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check email availability
   */
  async checkEmailAvailability(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.query as { email: string };
    const userId = (request.user as any)?.id;

    try {
      const isAvailable = await userProfileService.checkEmailAvailability(
        email,
        userId
      );

      return reply.send({
        success: true,
        data: { available: isAvailable },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search for users
   */
  async searchUsers(request: FastifyRequest, reply: FastifyReply) {
    const { q, limit } = request.query as { q: string; limit?: string };

    try {
      const users = await userProfileService.searchUsers(
        q,
        limit ? parseInt(limit) : 10
      );

      return reply.send({
        success: true,
        data: { users },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as any;

    try {
      await userProfileService.deleteAccount(userId, body.password);

      return reply.code(204).send();
    } catch (error) {
      throw error;
    }
  }
}

export const userProfileController = new UserProfileController();
