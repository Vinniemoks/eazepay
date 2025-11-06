import crypto from 'crypto';

// Security configuration interface
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
    algorithm: string;
  };
  apiKeys: {
    internal: string;
    rotationInterval: number;
    minLength: number;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
    maxAge: number;
  };
  headers: {
    security: boolean;
    removePoweredBy: boolean;
    hsts: {
      enabled: boolean;
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  validation: {
    maxRequestSize: number;
    maxParameterLength: number;
    maxHeaderLength: number;
    strictMode: boolean;
  };
  logging: {
    audit: boolean;
    sanitize: boolean;
    level: string;
  };
}

// Environment validation
function validateEnvironment(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'INTERNAL_API_KEY',
    'NODE_ENV',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  // Check for weak secrets
  const weakSecrets = [
    'your_super_secret_jwt_key_change_in_production',
    'your-super-secret-jwt-key-at-least-32-characters-long-change-this-in-production',
    'your_secret_key_change_in_production',
    'super_secret_jwt_key_change_me',
    'CHANGE_ME_TO_STRONG_RANDOM_SECRET_MIN_32_CHARS',
    'your-super-secret-jwt-key-min-32-chars',
  ];
  
  if (weakSecrets.includes(jwtSecret)) {
    throw new Error('JWT_SECRET is using a default/weak value. Generate a strong random secret.');
  }
  
  // Validate API key format
  const internalApiKey = process.env.INTERNAL_API_KEY!;
  if (internalApiKey.length < 20) {
    throw new Error('INTERNAL_API_KEY must be at least 20 characters long');
  }
  
  // Validate environment
  const validEnvironments = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(process.env.NODE_ENV!)) {
    throw new Error(`NODE_ENV must be one of: ${validEnvironments.join(', ')}`);
  }
}

// Generate secure configuration
function generateSecureConfig(): SecurityConfig {
  validateEnvironment();
  
  return {
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'afripay-iot-service',
      audience: process.env.JWT_AUDIENCE || 'afripay-services',
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
    },
    apiKeys: {
      internal: process.env.INTERNAL_API_KEY!,
      rotationInterval: parseInt(process.env.API_KEY_ROTATION_INTERVAL || '2592000'), // 30 days
      minLength: parseInt(process.env.API_KEY_MIN_LENGTH || '20'),
    },
    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'false',
    },
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://localhost:3000',
      ],
      allowedMethods: process.env.CORS_ALLOWED_METHODS?.split(',') || [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
      ],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || [
        'Content-Type',
        'Authorization',
        'X-Internal-API-Key',
        'X-Correlation-ID',
      ],
      credentials: process.env.CORS_CREDENTIALS !== 'false',
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'), // 24 hours
    },
    headers: {
      security: process.env.SECURITY_HEADERS_ENABLED !== 'false',
      removePoweredBy: process.env.REMOVE_POWERED_BY !== 'false',
      hsts: {
        enabled: process.env.HSTS_ENABLED !== 'false',
        maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'), // 1 year
        includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
        preload: process.env.HSTS_PRELOAD === 'true',
      },
    },
    validation: {
      maxRequestSize: parseInt(process.env.MAX_REQUEST_SIZE || '10485760'), // 10MB
      maxParameterLength: parseInt(process.env.MAX_PARAMETER_LENGTH || '1024'),
      maxHeaderLength: parseInt(process.env.MAX_HEADER_LENGTH || '8192'),
      strictMode: process.env.STRICT_VALIDATION_MODE === 'true',
    },
    logging: {
      audit: process.env.AUDIT_LOGGING_ENABLED !== 'false',
      sanitize: process.env.SANITIZE_LOGGING !== 'false',
      level: process.env.LOG_LEVEL || 'info',
    },
  };
}

// Security utilities
export class SecurityUtils {
  // Generate cryptographically secure random string
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64');
  }
  
  // Generate secure API key
  static generateApiKey(): string {
    return 'ak_' + crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
  }
  
  // Generate secure JWT secret
  static generateJWTSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('base64');
  }
  
  // Hash sensitive data for logging
  static hashForLogging(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
  }
  
  // Constant-time string comparison (prevents timing attacks)
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    
    return crypto.timingSafeEqual(bufferA, bufferB);
  }
  
  // Validate API key format
  static validateApiKeyFormat(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    if (apiKey.length < 20) {
      return false;
    }
    
    // Check for common patterns
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(apiKey)) {
      return false;
    }
    
    return true;
  }
  
  // Sanitize error messages
  static sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Hide sensitive information
      const sensitivePatterns = [
        /connection.*string/i,
        /password/i,
        /secret/i,
        /key/i,
        /token/i,
        /database/i,
        /sql/i,
        /query/i,
      ];
      
      if (sensitivePatterns.some(pattern => pattern.test(message))) {
        return 'An internal error occurred';
      }
      
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
  
  // Validate environment for production
  static validateProductionEnvironment(): void {
    if (process.env.NODE_ENV === 'production') {
      // Ensure HTTPS is enforced
      if (process.env.FORCE_HTTPS !== 'true') {
        console.warn('WARNING: FORCE_HTTPS should be enabled in production');
      }
      
      // Ensure debug mode is disabled
      if (process.env.DEBUG === 'true') {
        throw new Error('DEBUG mode should be disabled in production');
      }
      
      // Ensure secure headers are enabled
      if (process.env.SECURITY_HEADERS_ENABLED === 'false') {
        throw new Error('Security headers should be enabled in production');
      }
      
      // Ensure rate limiting is enabled
      if (process.env.RATE_LIMITING_ENABLED === 'false') {
        throw new Error('Rate limiting should be enabled in production');
      }
      
      // Validate JWT secret strength in production
      const jwtSecret = process.env.JWT_SECRET!;
      if (jwtSecret.length < 64) {
        throw new Error('JWT_SECRET should be at least 64 characters in production');
      }
    }
  }
}

// Initialize security configuration
export const securityConfig = generateSecureConfig();

// Validate production environment if applicable
SecurityUtils.validateProductionEnvironment();

// Export security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';",
  };
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: securityConfig.rateLimiting.windowMs,
  max: securityConfig.rateLimiting.maxRequests,
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(securityConfig.rateLimiting.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: securityConfig.rateLimiting.skipSuccessfulRequests,
  skipFailedRequests: securityConfig.rateLimiting.skipFailedRequests,
};

export default securityConfig;