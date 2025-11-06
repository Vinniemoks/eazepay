import { Request, Response, NextFunction } from 'express';

// Security configuration
const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Restrict inline scripts
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"], // Disable object/embed tags
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"], // Prevent clickjacking
  },
  
  // CORS configuration
  CORS: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-API-Key', 'X-Correlation-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// Build Content Security Policy header
function buildCSPHeader(): string {
  const directives = Object.entries(SECURITY_CONFIG.CSP)
    .map(([directive, sources]) => `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sources.join(' ')}`)
    .join('; ');
  
  return directives;
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', buildCSPHeader());
  
  // Remove server fingerprinting headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
}

// CORS middleware with security controls
export function corsSecurity(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('Origin');
  
  // Validate origin
  if (origin && SECURITY_CONFIG.CORS.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow same-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', SECURITY_CONFIG.CORS.allowedMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', SECURITY_CONFIG.CORS.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', SECURITY_CONFIG.CORS.credentials.toString());
  res.setHeader('Access-Control-Max-Age', SECURITY_CONFIG.CORS.maxAge.toString());
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}

// Request sanitization middleware
export function sanitizeRequest(req: Request, res: Response, next: NextFunction): void {
  // Remove suspicious headers that could indicate attacks
  const suspiciousHeaders = [
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Client-IP',
    'X-Remote-Addr',
    'X-Remote-IP',
  ];
  
  suspiciousHeaders.forEach(header => {
    delete req.headers[header.toLowerCase()];
  });
  
  // Validate request size
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    res.status(413).json({
      error: 'Request entity too large',
      code: 'VALIDATION_002',
      message: 'Request body exceeds maximum allowed size',
    });
    return;
  }
  
  // Sanitize request path
  const path = req.path;
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /[<>'"]/, // XSS attempts
    /[\x00-\x1f\x7f]/, // Control characters
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(path))) {
    res.status(400).json({
      error: 'Bad request',
      code: 'VALIDATION_003',
      message: 'Request contains suspicious characters',
    });
    return;
  }
  
  next();
}

// Error response sanitization
export function sanitizeErrorResponse(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Remove sensitive information from error responses
    if (body && body.error && !body.code?.startsWith('VALIDATION_')) {
      const sanitizedBody = {
        error: 'Internal server error',
        code: body.code || 'INTERNAL_ERROR',
        correlationId: req.get('X-Correlation-ID') || 'unknown',
        timestamp: new Date().toISOString(),
      };
      
      return originalJson.call(this, sanitizedBody);
    }
    
    // Remove stack traces and internal details
    if (body && typeof body === 'object') {
      const sanitizedBody = { ...body };
      delete sanitizedBody.stack;
      delete sanitizedBody.sql;
      delete sanitizedBody.query;
      delete sanitizedBody.config;
      delete sanitizedBody.password;
      delete sanitizedBody.secret;
      delete sanitizedBody.key;
      
      return originalJson.call(this, sanitizedBody);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
}