import { User } from '../models/User.js';
import { EmailVerificationToken } from '../models/EmailVerificationToken.js';
import { emailService } from './emailService.js';
import { UnauthorizedError } from '../utils/errors.js';
import { IUser } from '../types/index.js';
import crypto from 'crypto';

export class EmailVerificationService {
  /**
   * Generate a verification token and send verification email
   */
  async sendVerificationEmail(userId: string, email: string, firstName: string): Promise<void> {
    try {
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Save token to database
      await EmailVerificationToken.create({
        userId,
        token,
        expiresAt,
      });

      // Create verification link
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

      // Send email
      await emailService.sendVerificationEmail(email, firstName, verificationLink);
    } catch (error) {
      throw new Error(`Failed to send verification email: ${error}`);
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmailWithToken(token: string): Promise<IUser> {
    try {
      // Find the verification token
      const verificationToken = await EmailVerificationToken.findOne({ token });

      if (!verificationToken) {
        throw new UnauthorizedError('Invalid verification token');
      }

      // Check if token is expired
      if (new Date() > verificationToken.expiresAt) {
        await EmailVerificationToken.deleteOne({ _id: verificationToken._id });
        throw new UnauthorizedError('Verification token has expired');
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        verificationToken.userId,
        { isEmailVerified: true },
        { new: true }
      );

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Delete the used token
      await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName);

      return user.toObject();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Delete existing tokens for this user
      await EmailVerificationToken.deleteMany({ userId });

      // Send new verification email
      await this.sendVerificationEmail(userId, user.email, user.firstName);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user.isEmailVerified;
  }
}

export const emailVerificationService = new EmailVerificationService();
