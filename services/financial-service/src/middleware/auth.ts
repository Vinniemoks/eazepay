// Authentication middleware - now using shared @afripay/auth-middleware
// This file delegates to the shared authentication library

export { 
  authenticate as authMiddleware, 
  AuthRequest,
  requireRole,
  requirePermission
} from '@afripay/auth-middleware';
