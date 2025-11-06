import { ErrorCode, ErrorDetails } from './types';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: ErrorDetails) {
    super(message, 400, ErrorCode.BAD_REQUEST, true, details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = ErrorCode.UNAUTHORIZED) {
    super(message, 401, code, true);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = ErrorCode.FORBIDDEN) {
    super(message, 403, code, true);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', resource?: string) {
    super(
      message,
      404,
      ErrorCode.RESOURCE_NOT_FOUND,
      true,
      resource ? { resource } : undefined
    );
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: ErrorDetails) {
    super(message, 409, ErrorCode.RESOURCE_CONFLICT, true, details);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(
      message,
      422,
      ErrorCode.VALIDATION_ERROR,
      true,
      errors ? { errors } : undefined
    );
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(
      message,
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      true,
      retryAfter ? { retryAfter } : undefined
    );
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(message, 500, ErrorCode.INTERNAL_ERROR, false, details);
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', service?: string) {
    super(
      message,
      503,
      ErrorCode.SERVICE_UNAVAILABLE,
      true,
      service ? { service } : undefined
    );
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database error', details?: ErrorDetails) {
    super(message, 500, ErrorCode.DATABASE_ERROR, false, details);
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string = 'External service error',
    service?: string,
    statusCode?: number
  ) {
    super(
      message,
      statusCode || 502,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      true,
      service ? { service } : undefined
    );
  }
}

/**
 * Business Logic Error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, code: string = ErrorCode.INVALID_OPERATION, details?: ErrorDetails) {
    super(message, 400, code, true, details);
  }
}

/**
 * Insufficient Balance Error
 */
export class InsufficientBalanceError extends BusinessLogicError {
  constructor(message: string = 'Insufficient balance', balance?: number, required?: number) {
    super(
      message,
      ErrorCode.INSUFFICIENT_BALANCE,
      balance !== undefined && required !== undefined
        ? { balance, required, shortfall: required - balance }
        : undefined
    );
  }
}

/**
 * Transaction Failed Error
 */
export class TransactionFailedError extends BusinessLogicError {
  constructor(message: string = 'Transaction failed', reason?: string) {
    super(
      message,
      ErrorCode.TRANSACTION_FAILED,
      reason ? { reason } : undefined
    );
  }
}

/**
 * Timeout Error
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout', timeout?: number) {
    super(
      message,
      408,
      ErrorCode.TIMEOUT_ERROR,
      true,
      timeout ? { timeout } : undefined
    );
  }
}
