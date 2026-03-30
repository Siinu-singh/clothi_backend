// Password utilities using Node.js crypto for hashing
// In production, consider using bcryptjs or argon2

import crypto from 'crypto';

/**
 * Hash a password with salt
 * Note: For production, use bcryptjs or argon2 for better security
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash password with salt using PBKDF2
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  
  // Return salt + hash
  return `${salt}$${hash}`;
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // Extract salt and hash
    const [salt, hash] = hashedPassword.split('$');
    
    if (!salt || !hash) {
      return false;
    }
    
    // Hash the provided password with the same salt
    const hashToCheck = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    
    // Compare hashes
    return hashToCheck === hash;
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
