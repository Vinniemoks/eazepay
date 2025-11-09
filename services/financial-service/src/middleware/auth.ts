// Authentication middleware - now using shared @eazepay/auth-middleware
// This file delegates to the shared authentication library

export { 
  authenticate as authMiddleware, 
  AuthRequest,
  requireRole,
  requirePermission
} from '@eazepay/auth-middleware';
