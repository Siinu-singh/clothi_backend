import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { emailService } from './emailService.js';
import { hashPassword } from '../utils/password.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { IUser } from '../types/index.js';
import crypto from 'crypto';

export class PasswordResetService {
  /**
   * Generate password reset token and send email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if email exists for security
        return;
      }

      // Delete existing reset tokens for this user
      await PasswordResetToken.deleteMany({ userId: user._id });

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to database
      await PasswordResetToken.create({
        userId: user._id,
        token,
        expiresAt,
      });

      // Create reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

      // Send email
      await emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
    } catch (error) {
      throw new Error(`Failed to process password reset request: ${error}`);
    }
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<IUser> {
    try {
      // Find the password reset token
      const resetToken = await PasswordResetToken.findOne({ token });

      if (!resetToken) {
        throw new UnauthorizedError('Invalid password reset token');
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        await PasswordResetToken.deleteOne({ _id: resetToken._id });
        throw new UnauthorizedError('Password reset token has expired');
      }

      // Find user
      const user = await User.findById(resetToken.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      user.password = hashedPassword;
      await user.save();

      // Delete the used token
      await PasswordResetToken.deleteOne({ _id: resetToken._id });

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password (requires old password)
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser> {
    try {
      // Find user with password field
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify old password
      const { comparePassword } = await import('../utils/password.js');
      const isPasswordValid = await comparePassword(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify if reset token is valid
   */
  async validateResetToken(token: string): Promise<boolean> {
    try {
      const resetToken = await PasswordResetToken.findOne({ token });

      if (!resetToken) {
        return false;
      }

      // Check if token is expired
      if (new Date() > resetToken.expiresAt) {
        await PasswordResetToken.deleteOne({ _id: resetToken._id });
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const passwordResetService = new PasswordResetService();
