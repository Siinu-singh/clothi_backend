import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { IUser } from '../types/index.js';
import { oauthService } from './oauthService.js';
import { emailVerificationService } from './emailVerificationService.js';

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<IUser> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();

    // Send verification email
    try {
      await emailVerificationService.sendVerificationEmail(
        user._id.toString(),
        user.email,
        user.firstName
      );
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error);
    }

    return user.toObject();
  }

  async login(email: string, password: string): Promise<IUser> {
    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return user.toObject();
  }

  async loginWithGoogle(googleToken: string): Promise<{ user: IUser; isNewUser: boolean }> {
    const { user, isNewUser } = await oauthService.loginWithGoogle(googleToken);

    // If new user, send verification email (though OAuth typically auto-verifies)
    if (isNewUser && !user.isEmailVerified) {
      try {
        await emailVerificationService.sendVerificationEmail(
          user._id.toString(),
          user.email,
          user.firstName
        );
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    }

    return { user, isNewUser };
  }

  async loginWithApple(appleToken: string, user?: { email?: string; name?: { firstName?: string; lastName?: string } }): Promise<{ user: IUser; isNewUser: boolean }> {
    const { user: appUser, isNewUser } = await oauthService.loginWithApple(appleToken, user);

    // Apple typically auto-verifies emails, but send verification if needed
    if (isNewUser && !appUser.isEmailVerified) {
      try {
        await emailVerificationService.sendVerificationEmail(
          appUser._id.toString(),
          appUser.email,
          appUser.firstName
        );
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    }

    return { user: appUser, isNewUser };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    return user ? user.toObject() : null;
  }

  async updateUser(userId: string, updates: Partial<IUser>): Promise<IUser> {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user.toObject();
  }

  async verifyEmail(userId: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user.toObject();
  }
}

export const authService = new AuthService();
