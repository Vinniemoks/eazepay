import type { Request, Response, NextFunction } from 'express';
import { requireRole, requirePermission } from './permissions';

export type AuthUser = {
  id: string;
  role: string;
  permissions: string[];
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const requiredKey = process.env.INTERNAL_API_KEY;
  if (!requiredKey) {
    // Dev mode: attach a superuser for convenience
    req.user = { id: 'dev-user', role: 'SUPERUSER', permissions: [] };
    return next();
  }
  const provided = (req.headers['x-internal-api-key'] as string) || '';
  if (provided && provided === requiredKey) {
    req.user = { id: 'internal-user', role: 'SUPERUSER', permissions: [] };
    return next();
  }
  return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing internal API key' });
}

export { requireRole, requirePermission };
