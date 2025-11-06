import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { InsufficientPermissionsError } from '../errors';

/**
 * Require specific permission
 */
export function requirePermission(permission: string) {
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

      const userPermissions = req.user.permissions || [];
      
      if (!userPermissions.includes(permission)) {
        throw new InsufficientPermissionsError(permission);
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
 * Require any of the specified permissions
 */
export function requireAnyPermission(permissions: string[]) {
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

      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some(p => userPermissions.includes(p));
      
      if (!hasPermission) {
        throw new InsufficientPermissionsError(permissions);
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
 * Require all of the specified permissions
 */
export function requireAllPermissions(permissions: string[]) {
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

      const userPermissions = req.user.permissions || [];
      const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
      
      if (!hasAllPermissions) {
        throw new InsufficientPermissionsError(permissions);
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
