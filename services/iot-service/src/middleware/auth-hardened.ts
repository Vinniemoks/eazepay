import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { 
  verifyAccessTokenSecure, 
  validateInternalApiKey,
  sanitizeErrorMessage,
  getSecurityHeaders,
  hashForLogging
} from '../utils/security-hardened';

// Rate limiters for different authentication scenarios
const bruteForceLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_brute_force',
  points: 5, // 5 attempts
  duration: 300, // per 5 minutes
  blockDuration: 900, // block for 15 minutes
});

const tokenReuseLimiter = new RateLimiterMemory({
  keyPrefix: 'token_reuse',
  points: 10, // 10 token validations per minute
  duration: 60,
});

// Security configuration
const SECURITY_CONFIG = {
  MAX_TOKEN_LENGTH: 4096, // Maximum token length to prevent DoS
  ALLOWED_AUTH_SCHEMES: ['Bearer'],
  INTERNAL_API_KEY_HEADER: 'x-internal-api-key',
  RATE_LIMIT_HEADERS: true,
  LOG_AUTH_FAILURES: true,
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        permissions: string[];
        sessionId: string;
        authenticatedAt: number;
      };
      security?: {
        correlationId: string;
        clientIp: string;
        userAgent: string;
      };
    }
  }
}

// Enhanced authentication middleware with security controls
export async function authenticateHardened(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const correlationId = crypto.randomUUID();
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Add security context to request
  req.security = {
    correlationId,
    clientIp,
    userAgent,
  };
  
  // Apply security headers
  Object.entries(getSecurityHeaders()).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Add correlation ID to response
  res.setHeader('X-Correlation-ID', correlationId);
  
  try {
    // Check for internal API key first (service-to-service communication)
    const internalApiKeyHeader = req.headers[SECURITY_CONFIG.INTERNAL_API_KEY_HEADER] as string | undefined;
    if (internalApiKeyHeader) {
      await handleInternalApiKeyAuth(internalApiKeyHeader, req, res, next, clientIp);
      return;
    }
    
    // Handle JWT authentication
    await handleJwtAuth(req, res, next, clientIp);
    
  } catch (error) {
    logAuthFailure(req, 'SYSTEM_ERROR', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'SYS_001',
      correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}

// Handle internal API key authentication
async function handleInternalApiKeyAuth(
  apiKey: string,
  req: Request,
  res: Response,
  next: NextFunction,
  clientIp: string
): Promise<void> {
  try {
    // Rate limit API key attempts
    await bruteForceLimiter.consume(`api_key:${clientIp}`);
    
    // Validate API key format
    if (!apiKey || apiKey.length < 20) {
      logAuthFailure(req, 'INVALID_API_KEY_FORMAT');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_004',
        message: 'Invalid API key format',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Validate API key
    if (!validateInternalApiKey(apiKey)) {
      logAuthFailure(req, 'INVALID_API_KEY');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_005',
        message: 'Invalid API key',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Mark as internal service for audit logging
    req.user = {
      userId: 'internal_service',
      email: 'system@internal',
      role: 'SYSTEM',
      permissions: ['*'],
      sessionId: 'internal',
      authenticatedAt: Date.now(),
    };
    
    next();
  } catch (rateLimitError) {
    logAuthFailure(req, 'RATE_LIMIT_EXCEEDED');
    res.status(429).json({
      error: 'Too many authentication attempts',
      code: 'RATE_001',
      retryAfter: 900, // 15 minutes
      correlationId: req.security!.correlationId,
    });
  }
}

// Handle JWT authentication
async function handleJwtAuth(
  req: Request,
  res: Response,
  next: NextFunction,
  clientIp: string
): Promise<void> {
  try {
    // Rate limit token validation attempts
    await tokenReuseLimiter.consume(`token:${clientIp}`);
    
    const authHeader = req.headers.authorization;
    
    // Validate authorization header
    if (!authHeader) {
      logAuthFailure(req, 'MISSING_AUTH_HEADER');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_001',
        message: 'No authentication header provided',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Parse authorization header
    const [scheme, token] = authHeader.split(' ');
    
    if (!scheme || !token) {
      logAuthFailure(req, 'MALFORMED_AUTH_HEADER');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_002',
        message: 'Malformed authorization header',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Validate authentication scheme
    if (!SECURITY_CONFIG.ALLOWED_AUTH_SCHEMES.includes(scheme)) {
      logAuthFailure(req, 'UNSUPPORTED_AUTH_SCHEME', null, { scheme });
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_003',
        message: 'Unsupported authentication scheme',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Validate token length to prevent DoS
    if (token.length > SECURITY_CONFIG.MAX_TOKEN_LENGTH) {
      logAuthFailure(req, 'TOKEN_TOO_LONG');
      res.status(400).json({
        error: 'Bad request',
        code: 'VALIDATION_001',
        message: 'Token exceeds maximum length',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Verify token
    const payload = await verifyAccessTokenSecure(token, clientIp);
    
    // Additional security checks
    if (!payload.sessionId || !payload.userId) {
      logAuthFailure(req, 'INVALID_TOKEN_PAYLOAD');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_006',
        message: 'Invalid token payload',
        correlationId: req.security!.correlationId,
      });
      return;
    }
    
    // Set authenticated user
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
      authenticatedAt: Date.now(),
    };
    
    next();
  } catch (error) {
    const errorMessage = sanitizeErrorMessage(error);
    
    if (errorMessage.includes('expired')) {
      logAuthFailure(req, 'TOKEN_EXPIRED');
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_007',
        message: 'Token has expired',
        correlationId: req.security!.correlationId,
      });
    } else if (errorMessage.includes('rate limit')) {
      res.status(429).json({
        error: 'Too many authentication attempts',
        code: 'RATE_001',
        retryAfter: 60,
        correlationId: req.security!.correlationId,
      });
    } else {
      logAuthFailure(req, 'INVALID_TOKEN', error);
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_008',
        message: 'Invalid authentication token',
        correlationId: req.security!.correlationId,
      });
    }
  }
}

// Enhanced permission middleware with audit logging
export function requirePermissionHardened(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          code: 'AUTH_009',
          message: 'User not authenticated',
          correlationId: req.security!.correlationId,
        });
        return;
      }
      
      const hasPermission = req.user.permissions.includes(permissionCode);
      
      if (!hasPermission) {
        logAuthFailure(req, 'INSUFFICIENT_PERMISSIONS', null, { 
          requiredPermission: permissionCode,
          userPermissions: req.user.permissions 
        });
        
        res.status(403).json({
          error: 'Insufficient permissions',
          code: 'AUTH_010',
          message: 'Access denied',
          correlationId: req.security!.correlationId,
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'SYS_002',
        correlationId: req.security!.correlationId,
      });
    }
  };
}

// Audit logging for authentication failures
function logAuthFailure(
  req: Request,
  failureType: string,
  error?: unknown,
  metadata?: Record<string, any>
): void {
  if (!SECURITY_CONFIG.LOG_AUTH_FAILURES) return;
  
  const logData = {
    timestamp: new Date().toISOString(),
    correlationId: req.security?.correlationId,
    clientIp: hashForLogging(req.security?.clientIp || 'unknown'),
    userAgent: req.get('User-Agent'),
    failureType,
    path: req.path,
    method: req.method,
    ...(metadata && { metadata }),
  };
  
  // Log to security audit log (in production, send to SIEM)
  console.warn('SECURITY_AUDIT: Authentication failure', JSON.stringify(logData));
}