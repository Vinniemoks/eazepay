export { authenticate, optionalAuth, initializeAuth, getJWTService, getSessionManager } from './middleware/authenticate';
export { requireRole, requireAnyRole } from './middleware/authorize';
export { requirePermission, requireAnyPermission } from './middleware/permissions';
export { 
  RateLimiter, 
  createAuthRateLimiter, 
  createPasswordResetLimiter, 
  create2FALimiter, 
  createAPIRateLimiter 
} from './middleware/rateLimiter';
export { JWTService } from './services/JWTService';
export { SessionManager } from './services/SessionManager';
export { AuthRequest, TokenPayload, UserRole, AuthConfig } from './types';
export * from './errors';
