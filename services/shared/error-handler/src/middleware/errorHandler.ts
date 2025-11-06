import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { formatError, isOperationalError, sanitizeError } from '../utils';

// Logger interface (compatible with Winston)
interface Logger {
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
}

let logger: Logger | undefined;

/**
 * Initialize error handler with logger
 */
export function initializeErrorHandler(loggerInstance: Logger) {
  logger = loggerInstance;
}

/**
 * Main error handling middleware
 * Should be added as the last middleware in the chain
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate request ID if not present
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();

  // Determine if we should include stack trace
  const includeStack = process.env.NODE_ENV === 'development';

  // Format error response
  const errorResponse = formatError(
    error,
    includeStack,
    req.path,
    req.method,
    requestId
  );

  // Log error
  if (logger) {
    const logMeta = {
      ...sanitizeError(errorResponse),
      userId: (req as any).user?.userId,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (isOperationalError(error)) {
      logger.warn('Operational error occurred', logMeta);
    } else {
      logger.error('Unexpected error occurred', logMeta);
    }
  } else {
    // Fallback to console if logger not initialized
    console.error('Error:', error);
  }

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);

  // For non-operational errors, we might want to restart the process
  if (!isOperationalError(error)) {
    console.error('Non-operational error detected. Consider restarting the service.');
    // In production, you might want to:
    // process.exit(1);
  }
}

/**
 * 404 Not Found handler
 * Should be added before the error handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(
    `Route ${req.method} ${req.path} not found`,
    404,
    'ROUTE_NOT_FOUND',
    true
  );
  next(error);
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 * Converts validation errors to standard format
 */
export function validationErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.name === 'ValidationError') {
    const validationError = new AppError(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      true,
      {
        errors: error.details?.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }))
      }
    );
    return next(validationError);
  }
  next(error);
}

/**
 * Database error handler
 * Converts database errors to standard format
 */
export function databaseErrorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Duplicate key error
  if (error.code === 11000 || error.code === '23505') {
    const duplicateError = new AppError(
      'Resource already exists',
      409,
      'DUPLICATE_ENTRY',
      true,
      {
        field: Object.keys(error.keyValue || {})[0]
      }
    );
    return next(duplicateError);
  }

  // Foreign key constraint
  if (error.code === '23503') {
    const constraintError = new AppError(
      'Referenced resource not found',
      400,
      'CONSTRAINT_VIOLATION',
      true
    );
    return next(constraintError);
  }

  next(error);
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Unhandled rejection handler
 * Should be set up in the main application file
 */
export function setupUnhandledRejectionHandler(logger?: Logger): void {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    
    if (logger) {
      logger.error('Unhandled Promise Rejection', {
        error: error.message,
        stack: error.stack,
        reason: sanitizeError(reason)
      });
    } else {
      console.error('Unhandled Promise Rejection:', error);
    }

    // In production, you might want to exit the process
    // process.exit(1);
  });
}

/**
 * Uncaught exception handler
 * Should be set up in the main application file
 */
export function setupUncaughtExceptionHandler(logger?: Logger): void {
  process.on('uncaughtException', (error: Error) => {
    if (logger) {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
    } else {
      console.error('Uncaught Exception:', error);
    }

    // Exit the process - uncaught exceptions are serious
    process.exit(1);
  });
}
