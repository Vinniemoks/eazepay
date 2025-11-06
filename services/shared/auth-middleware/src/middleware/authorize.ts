import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { InvalidRoleError } from '../errors';

/**
 * Require specific role
 */
export function requireRole(role: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      if (req.user.role !== role) {
        throw new InvalidRoleError(role);
      }

      next();
    } catch (error: any) {
      res.status(error.statusCode || 403).json({
        success: false,
        error: error.message,
        code: error.code || 'AUTHZ_ERROR'
      });
    }
  };
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        throw new InvalidRoleError(roles);
      }

      next();
    } catch (error: any) {
      res.status(error.statusCode || 403).json({
        success: false,
        error: error.message,
        code: error.code || 'AUTHZ_ERROR'
      });
    }
  };
}

/**
 * Require SUPERUSER role
 */
export function requireSuperuser() {
  return requireRole(UserRole.SUPERUSER);
}

/**
 * Require ADMIN or SUPERUSER role
 */
export function requireAdmin() {
  return requireAnyRole([UserRole.ADMIN, UserRole.SUPERUSER]);
}

/**
 * Require MANAGER, ADMIN, or SUPERUSER role
 */
export function requireManager() {
  return requireAnyRole([UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPERUSER]);
}
