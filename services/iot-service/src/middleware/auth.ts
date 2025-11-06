import { Request, Response, NextFunction } from 'express';
import { verifyAccessTokenSecure, validateInternalApiKey } from '../utils/security-hardened';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const internalApiKeyHeader = req.headers['x-internal-api-key'] as string | undefined;
  if (validateInternalApiKey(internalApiKeyHeader)) {
    return next();
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Unauthorized',
        code: 'AUTH_001',
        message: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.substring(7);

    let payload;
    try {
      payload = await verifyAccessTokenSecure(token, req.ip);
    } catch (error) {
      res.status(401).json({ 
        error: 'Unauthorized',
        code: 'AUTH_003',
        message: 'Invalid or expired token'
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
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

      const hasPermission = req.user.permissions.includes(permissionCode);

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