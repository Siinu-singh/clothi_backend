import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(userId: string, role: string = 'customer'): TokenPair {
  const accessPayload = {
    id: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };

  const refreshPayload = {
    id: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(accessPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as any);

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as any);

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

export function decodeToken(token: string) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
