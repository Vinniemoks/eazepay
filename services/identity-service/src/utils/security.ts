// Security utilities for authentication and authorization
// Task: 2.1, 2.2, 2.4 - Authentication and permission validation

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { User, UserRole } from '../models/User';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
const JWT_EXPIRES_IN = '8h'; // 8 hour session duration
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 day refresh token

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// Generate JWT access token
export function generateAccessToken(user: User, sessionId: string, permissions: string[]): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions,
    sessionId
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'afripay-identity-service',
    audience: 'afripay-services'
  });
}

// Generate refresh token
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Generate token pair
export function generateTokenPair(user: User, sessionId: string, permissions: string[]): TokenPair {
  const accessToken = generateAccessToken(user, sessionId, permissions);
  const refreshToken = generateRefreshToken();

  return {
    accessToken,
    refreshToken,
    expiresIn: 8 * 60 * 60, // 8 hours in seconds
    refreshExpiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
  };
}

// Verify JWT token
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'afripay-identity-service',
      audience: 'afripay-services'
    }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Generate TOTP secret for 2FA
export function generateTwoFactorSecret(): string {
  const secret = speakeasy.generateSecret({
    name: 'AfriPay',
    length: 32
  });
  return secret.base32;
}

// Verify TOTP code
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock skew
  });
}

// Generate OTP for SMS
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 12); // 12 rounds for strong security
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
}

// Generate correlation ID for tracing
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

// Generate idempotency key
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

// Calculate SHA-256 hash
export function calculateSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Permission evaluation with deny-overrides
export interface Policy {
  effect: 'ALLOW' | 'DENY';
  permissions: string[];
  conditions?: any;
}

export function evaluatePermission(
  userPermissions: string[],
  requiredPermission: string,
  policies: Policy[] = []
): boolean {
  // 1. Check for explicit deny in policies (deny-overrides)
  const hasDeny = policies.some(
    p => p.effect === 'DENY' && p.permissions.includes(requiredPermission)
  );
  if (hasDeny) {
    return false;
  }

  // 2. Check if user has the permission
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // 3. Check for wildcard permissions (e.g., "FIN-*-VIEW")
  const hasWildcard = userPermissions.some(perm => {
    if (!perm.includes('*')) return false;
    const regex = new RegExp('^' + perm.replace(/\*/g, '.*') + '$');
    return regex.test(requiredPermission);
  });
  if (hasWildcard) {
    return true;
  }

  // 4. Check for explicit allow in policies
  const hasAllow = policies.some(
    p => p.effect === 'ALLOW' && p.permissions.includes(requiredPermission)
  );
  if (hasAllow) {
    return true;
  }

  // 5. Default deny (least privilege)
  return false;
}

// Check if user has any of the required permissions
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some(perm => 
    evaluatePermission(userPermissions, perm)
  );
}

// Check if user has all required permissions
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every(perm => 
    evaluatePermission(userPermissions, perm)
  );
}

// Validate permission code format (DEPT-RESOURCE-ACTION)
export function isValidPermissionCode(code: string): boolean {
  return /^[A-Z]+-[A-Z_]+-[A-Z]+$/.test(code);
}

// Send SMS (placeholder - integrate with actual SMS provider)
export async function sendSMS(phone: string, message: string): Promise<void> {
  // TODO: Integrate with SMS provider (Twilio, Africa's Talking, etc.)
  console.log(`📱 SMS to ${phone}: ${message}`);
  
  // In production, use actual SMS service:
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   to: phone,
  //   from: process.env.TWILIO_PHONE_NUMBER
  // });
}

// Mask PII data
export function maskPII(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) return value;
  const masked = '*'.repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

// Redact sensitive fields from objects
export function redactSensitiveData(obj: any, sensitiveFields: string[] = ['password', 'passwordHash', 'twoFactorSecret', 'biometricTemplateId']): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const redacted = { ...obj };
  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }
  return redacted;
}
