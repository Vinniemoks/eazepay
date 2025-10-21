// Authentication and Authorization Middleware
// Task: 2.4 - Implement permission validation middleware
// Requirements: 13.6, 13.7, 13.8

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Session } from '../models/Session';
import { UserPermission } from '../models/UserPermission';
import { verifyAccessToken, evaluatePermission } from '../utils/security';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        permissions: string[];
        sessionId: string;
      };
    }
  }
}

// Authenticate JWT token
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized',
        code: 'AUTH_001',
        message: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({ 
        error: 'Unauthorized',
        code: 'AUTH_003',
        message: 'Invalid or expired token'
      });
      return;
    }

    // Check if session is still active
    const sessionRepo = AppDataSource.getRepository(Session);
    const session = await sessionRepo.findOne({
      where: { id: payload.sessionId, isActive: true }
    });

    if (!session || session.isExpired()) {
      res.status(401).json({ 
        error: 'Unauthorized',
        code: 'AUTH_003',
        message: 'Session expired'
      });
      return;
    }

    // Update last activity
    session.lastActivityAt = new Date();
    await sessionRepo.save(session);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: payload.sessionId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'SYS_002'
    });
  }
}

// Require specific permission
export function requirePermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Unauthorized',
          code: 'AUTH_001'
        });
        return;
      }

      // Check if user has permission
      const hasPermission = evaluatePermission(
        req.user.permissions,
        permissionCode
      );

      if (!hasPermission) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'AUTH_002',
          message: `Required permission: ${permissionCode}`,
          requiredPermission: permissionCode
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'SYS_002'
      });
    }
  };
}

// Require any of the specified permissions
export function requireAnyPermission(permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Unauthorized',
          code: 'AUTH_001'
        });
        return;
      }

      // Check if user has any of the permissions
      const hasAnyPermission = permissionCodes.some(code =>
        evaluatePermission(req.user!.permissions, code)
      );

      if (!hasAnyPermission) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'AUTH_002',
          message: `Required one of: ${permissionCodes.join(', ')}`,
          requiredPermissions: permissionCodes
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'SYS_002'
      });
    }
  };
}

// Require specific role
export function requireRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ 
          error: 'Unauthorized',
          code: 'AUTH_001'
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'AUTH_002',
          message: `Required role: ${roles.join(' or ')}`,
          requiredRoles: roles
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'SYS_002'
      });
    }
  };
}

// Require superuser role
export const requireSuperuser = requireRole('SUPERUSER');

// Require manager role
export const requireManager = requireRole(['SUPERUSER', 'MANAGER']);

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyAccessToken(token);
      
      // Check session
      const sessionRepo = AppDataSource.getRepository(Session);
      const session = await sessionRepo.findOne({
        where: { id: payload.sessionId, isActive: true }
      });

      if (session && !session.isExpired()) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
          sessionId: payload.sessionId
        };
      }
    } catch (error) {
      // Invalid token, but continue without auth
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}
