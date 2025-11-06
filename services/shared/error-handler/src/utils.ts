import { AppError } from './errors';
import { ErrorResponse, ErrorDetails } from './types';

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Format error for response
 */
export function formatError(
  error: Error,
  includeStack: boolean = false,
  path?: string,
  method?: string,
  requestId?: string
): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: includeStack ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      path,
      method,
      requestId
    };
  }

  // Unknown error
  return {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    details: includeStack ? { originalError: error.message } : undefined,
    stack: includeStack ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    path,
    method,
    requestId
  };
}

/**
 * Extract error details from various error types
 */
export function extractErrorDetails(error: any): ErrorDetails | undefined {
  // Mongoose validation error
  if (error.name === 'ValidationError' && error.errors) {
    return {
      errors: Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
    };
  }

  // Sequelize validation error
  if (error.name === 'SequelizeValidationError' && error.errors) {
    return {
      errors: error.errors.map((err: any) => ({
        field: err.path,
        message: err.message
      }))
    };
  }

  // TypeORM query failed error
  if (error.name === 'QueryFailedError') {
    return {
      query: error.query,
      parameters: error.parameters
    };
  }

  // Joi validation error
  if (error.name === 'ValidationError' && error.details) {
    return {
      errors: error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  return undefined;
}

/**
 * Sanitize error for logging (remove sensitive data)
 */
export function sanitizeError(error: any): any {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];
  
  if (typeof error === 'object' && error !== null) {
    const sanitized: any = {};
    
    for (const key in error) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof error[key] === 'object') {
        sanitized[key] = sanitizeError(error[key]);
      } else {
        sanitized[key] = error[key];
      }
    }
    
    return sanitized;
  }
  
  return error;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.message;
  }

  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'ECONNREFUSED': 'Service temporarily unavailable. Please try again later.',
    'ETIMEDOUT': 'Request timed out. Please try again.',
    'ENOTFOUND': 'Service not found. Please contact support.',
    'ValidationError': 'Invalid input. Please check your data.',
    'CastError': 'Invalid data format.',
    'MongoError': 'Database error. Please try again later.'
  };

  return errorMap[error.name] || 'An unexpected error occurred. Please try again later.';
}
