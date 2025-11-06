import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error';
import { logger } from './logger';

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: ExpressHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    logger.error('API Error', { error: err.message, stack: err.stack });

    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }

    return res.status(500).json({ success: false, error: 'An unexpected error occurred' });
  });
};