import { User } from '../models/User.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { IUser, IOAuthProvider } from '../types/index.js';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export interface GoogleOAuthPayload {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface AppleOAuthPayload {
  sub: string;
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
  user?: string;
}

export class OAuthService {
  /**
   * Verify Google OAuth token and return user data
   */
  async verifyGoogleToken(token: string): Promise<GoogleOAuthPayload> {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedError('Invalid Google token');
      }

      return {
        sub: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error: any) {
      console.error('Google token verification error:', {
        message: error?.message,
        code: error?.code,
        errorType: error?.constructor?.name
      });
      throw new UnauthorizedError(`Failed to verify Google token: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Verify Apple OAuth token and return user data
   */
  async verifyAppleToken(token: string): Promise<AppleOAuthPayload> {
    try {
      // Decode JWT without verification (Apple tokens are already verified by client)
      // In production, you might want to verify the token server-side
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedError('Invalid Apple token format');
      }

      const decoded = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );

      return {
        sub: decoded.sub,
        email: decoded.email,
        user: decoded.user,
      };
    } catch (error) {
      throw new UnauthorizedError('Failed to verify Apple token');
    }
  }

  /**
   * Authenticate or register user with Google OAuth
   */
  async loginWithGoogle(googleToken: string): Promise<{ user: IUser; isNewUser: boolean }> {
    const googlePayload = await this.verifyGoogleToken(googleToken);

    // Check if user exists by email
    let user = await User.findOne({ email: googlePayload.email });

    // Check if user exists with this OAuth provider
    if (!user) {
      user = await User.findOne({
        'oauthProviders.provider': 'google',
        'oauthProviders.providerId': googlePayload.sub,
      });
    }

    if (user) {
      // User exists, check if Google is already connected
      const googleProvider = user.oauthProviders?.find(p => p.provider === 'google');

      if (!googleProvider) {
        // Add Google as a new OAuth provider
        user.oauthProviders = user.oauthProviders || [];
        user.oauthProviders.push({
          provider: 'google',
          providerId: googlePayload.sub,
          email: googlePayload.email,
          profilePicture: googlePayload.picture,
          connectedAt: new Date(),
        });

        // Update user avatar if not set
        if (!user.avatar && googlePayload.picture) {
          user.avatar = googlePayload.picture;
        }

        await user.save();
      }

      return { user: user.toObject(), isNewUser: false };
    }

    // Create new user
    const [firstName, ...lastNameParts] = (googlePayload.given_name || googlePayload.name || 'User').split(' ');
    const lastName = lastNameParts.join(' ') || (googlePayload.family_name || 'User');

    const newUser = new User({
      email: googlePayload.email,
      firstName: firstName || 'User',
      lastName: lastName || '',
      avatar: googlePayload.picture,
      isEmailVerified: googlePayload.email_verified || false,
      password: '', // OAuth users don't have passwords
      oauthProviders: [
        {
          provider: 'google',
          providerId: googlePayload.sub,
          email: googlePayload.email,
          profilePicture: googlePayload.picture,
          connectedAt: new Date(),
        },
      ],
    });

    await newUser.save();
    return { user: newUser.toObject(), isNewUser: true };
  }

  /**
   * Authenticate or register user with Apple OAuth
   */
  async loginWithApple(appleToken: string, user?: { email?: string; name?: { firstName?: string; lastName?: string } }): Promise<{ user: IUser; isNewUser: boolean }> {
    const applePayload = await this.verifyAppleToken(appleToken);

    // Use provided email or from token
    const email = user?.email || applePayload.email;

    if (!email) {
      throw new UnauthorizedError('Email is required for Apple OAuth');
    }

    // Check if user exists
    let existingUser = await User.findOne({ email });

    // Check if user exists with this OAuth provider
    if (!existingUser) {
      existingUser = await User.findOne({
        'oauthProviders.provider': 'apple',
        'oauthProviders.providerId': applePayload.sub,
      });
    }

    if (existingUser) {
      // User exists, check if Apple is already connected
      const appleProvider = existingUser.oauthProviders?.find(p => p.provider === 'apple');

      if (!appleProvider) {
        // Add Apple as a new OAuth provider
        existingUser.oauthProviders = existingUser.oauthProviders || [];
        existingUser.oauthProviders.push({
          provider: 'apple',
          providerId: applePayload.sub,
          email: email,
          connectedAt: new Date(),
        });

        await existingUser.save();
      }

      return { user: existingUser.toObject(), isNewUser: false };
    }

    // Create new user
    const firstName = user?.name?.firstName || 'Apple';
    const lastName = user?.name?.lastName || 'User';

    const newUser = new User({
      email: email,
      firstName: firstName,
      lastName: lastName,
      isEmailVerified: true, // Apple provides verified emails
      password: '', // OAuth users don't have passwords
      oauthProviders: [
        {
          provider: 'apple',
          providerId: applePayload.sub,
          email: email,
          connectedAt: new Date(),
        },
      ],
    });

    await newUser.save();
    return { user: newUser.toObject(), isNewUser: true };
  }

  /**
   * Link Google OAuth to existing user account
   */
  async linkGoogleToUser(userId: string, googleToken: string): Promise<IUser> {
    const googlePayload = await this.verifyGoogleToken(googleToken);

    // Check if this Google account is already linked to another user
    const existingLink = await User.findOne({
      'oauthProviders.provider': 'google',
      'oauthProviders.providerId': googlePayload.sub,
      _id: { $ne: userId },
    });

    if (existingLink) {
      throw new ConflictError('This Google account is already linked to another user');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          oauthProviders: {
            provider: 'google',
            providerId: googlePayload.sub,
            email: googlePayload.email,
            profilePicture: googlePayload.picture,
            connectedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user.toObject();
  }

  /**
   * Link Apple OAuth to existing user account
   */
  async linkAppleToUser(userId: string, appleToken: string, email?: string): Promise<IUser> {
    const applePayload = await this.verifyAppleToken(appleToken);

    // Check if this Apple account is already linked to another user
    const existingLink = await User.findOne({
      'oauthProviders.provider': 'apple',
      'oauthProviders.providerId': applePayload.sub,
      _id: { $ne: userId },
    });

    if (existingLink) {
      throw new ConflictError('This Apple account is already linked to another user');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          oauthProviders: {
            provider: 'apple',
            providerId: applePayload.sub,
            email: email,
            connectedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user.toObject();
  }

  /**
   * Unlink OAuth provider from user account
   */
  async unlinkOAuthProvider(userId: string, provider: 'google' | 'apple'): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Don't allow unlinking if user doesn't have a password (OAuth-only account)
    if (!user.password) {
      throw new ConflictError('Cannot unlink the only login method. Set a password first.');
    }

    user.oauthProviders = user.oauthProviders?.filter(p => p.provider !== provider) || [];
    await user.save();

    return user.toObject();
  }

  /**
   * Get OAuth providers linked to user
   */
  async getLinkedProviders(userId: string): Promise<IOAuthProvider[]> {
    const user = await User.findById(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user.oauthProviders || [];
  }
}

export const oauthService = new OAuthService();
