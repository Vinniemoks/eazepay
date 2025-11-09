import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for token validation to prevent brute force attacks
const tokenRateLimiter = new RateLimiterMemory({
  keyPrefix: 'token_validation',
  points: 10, // 10 attempts
  duration: 60, // per 60 seconds
});

// Rate limiter for failed authentication attempts
const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_attempts',
  points: 5, // 5 attempts
  duration: 300, // per 5 minutes
  blockDuration: 900, // block for 15 minutes after exceeding
});

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
}

// Secure JWT secret validation with minimum requirements
function validateJWTSecret(secret: string): void {
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  
  // Check for common weak secrets
  const weakSecrets = [
    'your_super_secret_jwt_key_change_in_production',
    'your-super-secret-jwt-key-at-least-32-characters-long-change-this-in-production',
    'your_secret_key_change_in_production',
    'super_secret_jwt_key_change_me',
    'CHANGE_ME_TO_STRONG_RANDOM_SECRET_MIN_32_CHARS'
  ];
  
  if (weakSecrets.includes(secret)) {
    throw new Error('JWT_SECRET is using a default/weak value. Generate a strong random secret.');
  }
  
  // Entropy check - ensure sufficient randomness
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < secret.length * 0.4) {
    throw new Error('JWT_SECRET lacks sufficient entropy. Use a more random secret.');
  }
}

// Secure random secret generation
export function generateSecureJWTSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('base64');
}

// Enhanced token verification with rate limiting and security checks
export async function verifyAccessTokenSecure(
  token: string, 
  clientIp?: string
): Promise<AccessTokenPayload> {
  try {
    // Rate limit token validation attempts
    if (clientIp) {
      await tokenRateLimiter.consume(clientIp);
    }
    
    const secret = process.env.JWT_SECRET;
    validateJWTSecret(secret!);
    
    // Verify token with enhanced security options
    const payload = jwt.verify(token, secret!, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      issuer: 'eazepay-identity-service',
      audience: 'eazepay-services',
      clockTolerance: 30, // 30 second clock skew tolerance
      maxAge: '8h', // Maximum token age
    }) as AccessTokenPayload;
    
    // Additional security validations
    if (!payload.userId || !payload.sessionId) {
      throw new Error('Invalid token payload structure');
    }
    
    // Check token expiration with buffer
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp - now < 60) {
      throw new Error('Token expires too soon');
    }
    
    return payload;
  } catch (error) {
    // Rate limit failed authentication attempts
    if (clientIp && error instanceof Error && error.message !== 'Rate limit exceeded') {
      try {
        await authRateLimiter.consume(clientIp);
      } catch (rateLimitError) {
        throw new Error('Too many authentication attempts. Please try again later.');
      }
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not yet valid');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    
    throw error;
  }
}

// Secure API key validation
export function validateInternalApiKey(providedKey: string): boolean {
  const expectedKey = process.env.INTERNAL_API_KEY;
  
  if (!expectedKey) {
    console.warn('INTERNAL_API_KEY not configured');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(providedKey),
    Buffer.from(expectedKey)
  );
}

// Generate secure API key
export function generateSecureApiKey(): string {
  return 'ak_' + crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
}

// Secure session ID generation
export function generateSecureSessionId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

// Hash sensitive data for logging (prevent data leakage)
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

// Sanitize error messages for client responses
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove sensitive information from error messages
    const message = error.message.toLowerCase();
    
    // Hide database errors, connection strings, etc.
    if (message.includes('connection') || 
        message.includes('database') || 
        message.includes('sql') ||
        message.includes('password') ||
        message.includes('secret') ||
        message.includes('key')) {
      return 'An internal error occurred';
    }
    
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Security headers for responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
  };
}