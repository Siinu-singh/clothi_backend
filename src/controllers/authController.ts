import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService.js';
import { oauthService } from '../services/oauthService.js';
import { emailVerificationService } from '../services/emailVerificationService.js';
import { passwordResetService } from '../services/passwordResetService.js';
import { generateTokens } from '../utils/jwt.js';
import {
  registerSchema,
  loginSchema,
} from '../utils/validators.js';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = registerSchema.parse(request.body);

    const user = await authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName
    );

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.code(201).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      },
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.parse(request.body);

    const user = await authService.login(body.email, body.password);
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      },
      message: 'Login successful',
    });
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { token: string };

    if (!body.token) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Verification token is required',
      });
    }

    const user = await emailVerificationService.verifyEmailWithToken(body.token);
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
      },
      message: 'Email verified successfully',
    });
  }

  async resendVerificationEmail(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'You must be logged in to resend verification email',
      });
    }

    await emailVerificationService.resendVerificationEmail(userId);

    return reply.code(200).send({
      success: true,
      message: 'Verification email resent successfully',
    });
  }

  async requestPasswordReset(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { email: string };

    if (!body.email) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Email is required',
      });
    }

    await passwordResetService.requestPasswordReset(body.email);

    return reply.code(200).send({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent',
    });
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { token: string; newPassword: string };

    if (!body.token || !body.newPassword) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Token and new password are required',
      });
    }

    const user = await passwordResetService.resetPasswordWithToken(body.token, body.newPassword);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      message: 'Password reset successfully',
    });
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as { oldPassword: string; newPassword: string };

    if (!body.oldPassword || !body.newPassword) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Old password and new password are required',
      });
    }

    const user = await passwordResetService.changePassword(userId, body.oldPassword, body.newPassword);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      message: 'Password changed successfully',
    });
  }

  async validateResetToken(request: FastifyRequest, reply: FastifyReply) {
    const { token } = request.params as { token: string };

    if (!token) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Token is required',
      });
    }

    const isValid = await passwordResetService.validateResetToken(token);

    return reply.code(200).send({
      success: true,
      data: { isValid },
    });
  }

  async loginWithGoogle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as { token: string };

      if (!body.token) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Google token is required',
        });
      }

      const { user, isNewUser } = await authService.loginWithGoogle(body.token);
      const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

      reply.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return reply.code(200).send({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          isNewUser,
        },
        message: isNewUser ? 'User registered with Google' : 'Login with Google successful',
      });
    } catch (error: any) {
      console.error('Google login error:', error);
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: error?.message || 'Google authentication failed',
      });
    }
  }

  async loginWithApple(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      token: string;
      user?: { email?: string; name?: { firstName?: string; lastName?: string } };
    };

    if (!body.token) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Apple token is required',
      });
    }

    const { user, isNewUser } = await authService.loginWithApple(body.token, body.user);
    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        isNewUser,
      },
      message: isNewUser ? 'User registered with Apple' : 'Login with Apple successful',
    });
  }

  async linkGoogleToProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as { token: string };

    if (!body.token) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Google token is required',
      });
    }

    const user = await oauthService.linkGoogleToUser(userId, body.token);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          oauthProviders: user.oauthProviders,
        },
      },
      message: 'Google account linked successfully',
    });
  }

  async linkAppleToProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const body = request.body as { token: string; email?: string };

    if (!body.token) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Apple token is required',
      });
    }

    const user = await oauthService.linkAppleToUser(userId, body.token, body.email);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          oauthProviders: user.oauthProviders,
        },
      },
      message: 'Apple account linked successfully',
    });
  }

  async unlinkOAuthProvider(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;
    const { provider } = request.params as { provider: 'google' | 'apple' };

    if (!provider || !['google', 'apple'].includes(provider)) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Valid provider (google or apple) is required',
      });
    }

    const user = await oauthService.unlinkOAuthProvider(userId, provider);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          oauthProviders: user.oauthProviders,
        },
      },
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully`,
    });
  }

  async getLinkedProviders(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    const providers = await oauthService.getLinkedProviders(userId);

    return reply.code(200).send({
      success: true,
      data: {
        providers: providers.map(p => ({
          provider: p.provider,
          email: p.email,
          connectedAt: p.connectedAt,
        })),
      },
    });
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    // Token verification happens in middleware, here we just generate new tokens
    const userId = (request.user as any)?.id;
    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
    }

    const { accessToken, refreshToken } = generateTokens(userId);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return reply.code(200).send({
      success: true,
      data: { accessToken },
      message: 'Token refreshed successfully',
    });
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any)?.id;

    const user = await authService.getUserById(userId);
    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return reply.code(200).send({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        oauthProviders: user.oauthProviders,
      },
    });
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('refreshToken');

    return reply.code(200).send({
      success: true,
      message: 'Logout successful',
    });
  }
}

export const authController = new AuthController();

