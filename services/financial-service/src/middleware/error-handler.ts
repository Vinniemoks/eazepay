import type { Request, Response, NextFunction } from 'express';
import type winston from 'winston';

export function initializeErrorHandler(logger: winston.Logger) {
  logger.info('Initializing error handling');
}

export function setupUnhandledRejectionHandler(logger: winston.Logger) {
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection', { reason });
  });
}

export function setupUncaughtExceptionHandler(logger: winston.Logger) {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  res.status(status).json({
    error: 'Server Error',
    message: err.message || 'An unexpected error occurred.',
  });
}