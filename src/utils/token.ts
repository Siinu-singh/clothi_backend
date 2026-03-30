import crypto from 'crypto';

/**
 * Generate a random token of specified length
 * @param length - Length of the token in characters
 * @returns Random hex string token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/**
 * Generate a URL-safe token
 * @param length - Length of the token in bytes
 * @returns URL-safe base64 string
 */
export function generateUrlSafeToken(length: number = 32): string {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
