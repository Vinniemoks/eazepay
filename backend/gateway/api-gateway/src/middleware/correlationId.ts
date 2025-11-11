import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Ensures every request has an X-Correlation-ID header.
 * - Reads incoming header if provided; otherwise generates a UUID.
 * - Sets the header on the response and stores it on the request for logging and proxying.
 */
export function correlationId(req: Request, res: Response, next: NextFunction) {
  const headerName = 'x-correlation-id';
  const id = (req.headers[headerName] as string) || randomUUID();

  // Ensure the ID is on the request for downstream services
  req.headers[headerName] = id;

  // Set the ID on the response for the client
  res.setHeader('X-Correlation-ID', id);
  next();
}