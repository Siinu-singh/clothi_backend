import { User } from '../models/User.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { IUser } from '../types/index.js';
import { hashPassword } from '../utils/password.js';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
}

export class UserProfileService {
  /**
   * Update user profile information
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUser> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate email if provided and changed
      if (input.email && input.email !== user.email) {
        const existingUser = await User.findOne({ email: input.email.toLowerCase() });
        if (existingUser) {
          throw new ValidationError('Email is already in use');
        }
        user.email = input.email.toLowerCase();
        user.isEmailVerified = false; // Require re-verification for new email
      }

      if (input.firstName) {
        user.firstName = input.firstName;
      }

      if (input.lastName) {
        user.lastName = input.lastName;
      }

      if (input.avatar) {
        user.avatar = input.avatar;
      }

      if (input.phone !== undefined) {
        user.phone = input.phone || null;
      }

      await user.save();
      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile (public info)
   */
  async getPublicProfile(userId: string): Promise<Partial<IUser>> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const userObj = user.toObject();

      // Return only public information
      return {
        _id: userObj._id,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        avatar: userObj.avatar,
        createdAt: userObj.createdAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile (private - full info)
   */
  async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { avatar: null },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search for users by name (limited public info)
   */
  async searchUsers(query: string, limit = 10): Promise<Partial<IUser>[]> {
    try {
      const users = await User.find(
        {
          $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
          ],
        },
        {
          firstName: 1,
          lastName: 1,
          avatar: 1,
          createdAt: 1,
        }
      ).limit(limit);

      return users.map(u => u.toObject());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user account statistics
   */
  async getUserStatistics(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // This would typically fetch related data from orders, favorites, etc.
      return {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accountCreatedAt: user.createdAt,
        lastUpdated: user.updatedAt,
        oauthProviders: user.oauthProviders?.length || 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password?: string): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // If user has a password, require password confirmation
      if (user.password && password) {
        const { comparePassword } = await import('../utils/password.js');
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
          throw new ValidationError('Invalid password');
        }
      }

      // Delete user and related data
      await User.findByIdAndDelete(userId);

      // TODO: Delete related data (orders, cart, favorites, addresses, etc.)
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: any = { email: email.toLowerCase() };

      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }

      const user = await User.findOne(query);
      return !user; // true if available, false if taken
    } catch (error) {
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();
