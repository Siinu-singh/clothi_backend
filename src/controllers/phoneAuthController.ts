import { FastifyRequest, FastifyReply } from 'fastify';
import { firebaseAuth } from '../config/firebase.js';
import { User } from '../models/User.js';
import { generateTokens } from '../utils/jwt.js';
import { isProduction } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';

interface PhoneLoginBody {
  idToken: string;
  /** Required for new users only */
  email?: string;
  firstName?: string;
  lastName?: string;
}

export class PhoneAuthController {
  /**
   * POST /auth/login/phone
   *
   * Flow:
   * 1. Frontend sends Firebase ID token after phone OTP verification.
   * 2. Backend verifies the token with Firebase Admin SDK.
   * 3. If the phone number is already linked to a user → login.
   * 4. If no user exists:
   *    a. If email + firstName + lastName are provided → register & login.
   *    b. Otherwise → return { profileRequired: true } so the frontend
   *       can show the "Complete Profile" form.
   */
  async loginWithPhone(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as PhoneLoginBody;

    if (!body.idToken) {
      throw new BadRequestError('Firebase ID token is required');
    }

    // ── Verify Firebase token ──────────────────────────────────────
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(body.idToken);
    } catch (error: any) {
      logger.error({ err: error }, 'Firebase token verification failed');
      throw new UnauthorizedError('Invalid or expired Firebase token');
    }

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw new BadRequestError('Token does not contain a phone number');
    }

    const firebaseUid = decodedToken.uid;

    // ── Lookup existing user by phone ──────────────────────────────
    let user = await User.findOne({ phone: phoneNumber });

    if (user) {
      // Existing user — issue tokens and return
      const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

      reply.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          isNewUser: false,
        },
        message: 'Login successful',
      });
    }

    // ── No user found — need profile details to register ───────────
    if (!body.email || !body.firstName || !body.lastName) {
      return reply.code(200).send({
        success: true,
        data: {
          profileRequired: true,
          phone: phoneNumber,
        },
        message: 'Please complete your profile to continue',
      });
    }

    // Check if email is already taken by another account
    const emailUser = await User.findOne({ email: body.email.toLowerCase() });
    if (emailUser) {
      throw new ConflictError('An account with this email already exists. Please login with email/password or Google instead.');
    }

    // ── Register new user ──────────────────────────────────────────
    const newUser = new User({
      email: body.email.toLowerCase(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      phone: phoneNumber,
      isEmailVerified: false,
      password: '', // Phone-auth users don't have passwords
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id.toString(), newUser.role);

    reply.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logger.info({ userId: newUser._id, phone: phoneNumber }, 'New user registered via phone auth');

    return reply.code(201).send({
      success: true,
      data: {
        user: {
          _id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          avatar: newUser.avatar,
          phone: newUser.phone,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
        },
        accessToken,
        isNewUser: true,
      },
      message: 'Account created successfully',
    });
  }
}

export const phoneAuthController = new PhoneAuthController();
