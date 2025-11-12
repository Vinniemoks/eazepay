import type { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const requiredKey = process.env.INTERNAL_API_KEY;
  if (!requiredKey) {
    // No key configured; treat as open for local/dev usage
    return next();
  }
  const provided = (req.headers['x-internal-api-key'] as string) || '';
  if (provided && provided === requiredKey) {
    return next();
  }
  return res.status(401).json({ error: 'unauthorized', message: 'Invalid or missing internal API key' });
}