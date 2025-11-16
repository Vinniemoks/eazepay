import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export interface SecurityMiddlewareConfig {
  cors?: {
    allowedOrigins: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  };
  helmet?: {
    contentSecurityPolicy?: boolean;
    hsts?: boolean;
    frameguard?: boolean;
  };
  rateLimiting?: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
  };
}

/**
 * Create comprehensive security middleware stack
 */
export function createSecurityMiddleware(config: SecurityMiddlewareConfig) {
  const middlewares: any[] = [];

  // Helmet for security headers
  if (config.helmet !== false) {
    middlewares.push(
      helmet({
        contentSecurityPolicy: config.helmet?.contentSecurityPolicy !== false ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
          }
        } : false,
        hsts: config.helmet?.hsts !== false ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        } : false,
        frameguard: config.helmet?.frameguard !== false ? {
          action: 'deny'
        } : false,
        xssFilter: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
      })
    );
  }

  // CORS configuration
  if (config.cors) {
    middlewares.push(
      cors({
        origin: (origin, callback) => {
          if (!origin || config.cors!.allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: config.cors.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: config.cors.allowedHeaders || ['Content-Type', 'Authorization'],
        credentials: config.cors.credentials !== false,
        maxAge: config.cors.maxAge || 86400
      })
    );
  }

  // Request sanitization
  middlewares.push(sanitizeRequest);

  // Security headers
  middlewares.push(additionalSecurityHeaders);

  return middlewares;
}

/**
 * Sanitize incoming requests
 */
function sanitizeRequest(req: Request, res: Response, next: NextFunction): void {
  // Remove potentially dangerous headers
  const dangerousHeaders = [
    'x-forwarded-host',
    'x-forwarded-server'
  ];

  dangerousHeaders.forEach(header => {
    delete req.headers[header];
  });

  // Validate content length
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      error: 'Request entity too large',
      code: 'REQUEST_TOO_LARGE'
    });
    return;
  }

  // Validate request path
  const suspiciousPatterns = [
    /\.\./,           // Directory traversal
    /[<>'"]/,         // XSS attempts
    /[\x00-\x1f\x7f]/ // Control characters
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(req.path))) {
    res.status(400).json({
      success: false,
      error: 'Invalid request path',
      code: 'INVALID_PATH'
    });
    return;
  }

  next();
}

/**
 * Additional security headers
 */
function additionalSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Remove server identification
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Add custom security headers
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * API Key authentication middleware
 */
export function apiKeyAuth(validKeys: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        code: 'API_KEY_REQUIRED'
      });
      return;
    }

    if (!validKeys.includes(apiKey)) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      });
      return;
    }

    next();
  };
}

/**
 * Internal service authentication
 */
export function internalServiceAuth(secretKey: string) {
  return (req: Request, res: Response, next: NextFunction): void {
    const internalKey = req.headers['x-internal-api-key'] as string;

    if (!internalKey || internalKey !== secretKey) {
      res.status(403).json({
        success: false,
        error: 'Forbidden - Internal service only',
        code: 'FORBIDDEN'
      });
      return;
    }

    next();
  };
}
