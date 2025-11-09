# @eazepay/error-handler

Centralized error handling for Eazepay microservices with consistent error responses, proper logging, and error tracking.

## Features

- ✅ Standardized error classes
- ✅ Consistent error response format
- ✅ Automatic error logging
- ✅ Stack trace in development
- ✅ Sensitive data sanitization
- ✅ Async error handling
- ✅ Database error mapping
- ✅ Validation error formatting
- ✅ User-friendly error messages
- ✅ Request ID tracking
- ✅ TypeScript support

## Installation

```bash
cd services/shared/error-handler
npm install
npm run build
```

Then in your service:

```bash
npm install file:../shared/error-handler
```

## Quick Start

### 1. Setup in Your Service

```typescript
import express from 'express';
import {
  errorHandler,
  notFoundHandler,
  initializeErrorHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} from '@eazepay/error-handler';
import logger from './utils/logger';

const app = express();

// Initialize error handler with logger
initializeErrorHandler(logger);

// Setup global error handlers
setupUnhandledRejectionHandler(logger);
setupUncaughtExceptionHandler(logger);

// Your routes...
app.use('/api', routes);

// 404 handler (before error handler)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

app.listen(3000);
```

### 2. Use Error Classes

```typescript
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  BadRequestError
} from '@eazepay/error-handler';

// In your route handler
app.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User not found', 'user');
  }
  
  res.json({ user });
});
```

### 3. Wrap Async Handlers

```typescript
import { asyncHandler } from '@eazepay/error-handler';

// Automatically catches async errors
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ users });
}));
```

## Error Classes

### General Errors

```typescript
// 400 Bad Request
throw new BadRequestError('Invalid input');

// 404 Not Found
throw new NotFoundError('User not found', 'user');

// 409 Conflict
throw new ConflictError('Email already exists');

// 422 Validation Error
throw new ValidationError('Validation failed', [
  { field: 'email', message: 'Invalid email format' }
]);

// 500 Internal Server Error
throw new InternalServerError('Something went wrong');
```

### Authentication Errors

```typescript
// 401 Unauthorized
throw new UnauthorizedError('Invalid credentials');

// 403 Forbidden
throw new ForbiddenError('Access denied');
```

### Business Logic Errors

```typescript
// Insufficient balance
throw new InsufficientBalanceError('Insufficient funds', 100, 150);

// Transaction failed
throw new TransactionFailedError('Payment declined', 'Card expired');

// Invalid operation
throw new BusinessLogicError('Cannot delete active account');
```

### External Service Errors

```typescript
// Service unavailable
throw new ServiceUnavailableError('Payment gateway unavailable', 'stripe');

// External service error
throw new ExternalServiceError('API call failed', 'payment-service', 502);

// Timeout
throw new TimeoutError('Request timeout', 30000);
```

### Database Errors

```typescript
// Database error
throw new DatabaseError('Query failed');
```

### Rate Limiting

```typescript
// Rate limit exceeded
throw new RateLimitError('Too many requests', 60);
```

## Error Response Format

All errors return a consistent format:

```json
{
  "success": false,
  "error": "User not found",
  "code": "RESOURCE_NOT_FOUND",
  "statusCode": 404,
  "details": {
    "resource": "user"
  },
  "timestamp": "2025-11-06T10:30:00Z",
  "path": "/api/users/123",
  "method": "GET",
  "requestId": "1699267800000-abc123"
}
```

### Development Mode

In development, stack traces are included:

```json
{
  "success": false,
  "error": "User not found",
  "code": "RESOURCE_NOT_FOUND",
  "statusCode": 404,
  "stack": "Error: User not found\n    at ...",
  "timestamp": "2025-11-06T10:30:00Z"
}
```

## Error Codes

Standard error codes for consistency:

```typescript
enum ErrorCode {
  // General (1000-1999)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Authentication (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Authorization (3000-3999)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resources (4000-4999)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Business Logic (5000-5999)
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INVALID_OPERATION = 'INVALID_OPERATION',
  
  // External Services (6000-6999)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Database (7000-7999)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Rate Limiting (8000-8999)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## Advanced Usage

### Custom Error Classes

```typescript
import { AppError, ErrorCode } from '@eazepay/error-handler';

class PaymentDeclinedError extends AppError {
  constructor(reason: string) {
    super(
      'Payment declined',
      402,
      'PAYMENT_DECLINED',
      true,
      { reason }
    );
  }
}

throw new PaymentDeclinedError('Insufficient funds');
```

### Error Details

Add context to errors:

```typescript
throw new ValidationError('Validation failed', [
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);

throw new InsufficientBalanceError(
  'Cannot complete transaction',
  100,  // current balance
  150   // required amount
);
```

### Async Handler

Wrap async route handlers:

```typescript
import { asyncHandler } from '@eazepay/error-handler';

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ users });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user });
}));
```

### Database Error Mapping

Automatically converts database errors:

```typescript
// Duplicate key error (MongoDB code 11000, PostgreSQL 23505)
// Automatically converted to ConflictError

// Foreign key constraint (PostgreSQL 23503)
// Automatically converted to BadRequestError
```

### Validation Error Formatting

Supports multiple validation libraries:

```typescript
// Joi validation errors
// Mongoose validation errors
// Sequelize validation errors
// TypeORM query errors

// All converted to standard format
```

## Logging

Errors are automatically logged with context:

```typescript
// Operational errors (expected)
logger.warn('Operational error occurred', {
  error: 'User not found',
  code: 'RESOURCE_NOT_FOUND',
  statusCode: 404,
  path: '/api/users/123',
  method: 'GET',
  userId: 'user-123',
  ip: '192.168.1.1'
});

// Programming errors (unexpected)
logger.error('Unexpected error occurred', {
  error: 'Cannot read property of undefined',
  code: 'INTERNAL_ERROR',
  statusCode: 500,
  stack: '...'
});
```

### Sensitive Data Sanitization

Automatically redacts sensitive fields:

```typescript
// Fields like password, token, secret, apiKey are redacted
{
  email: 'user@example.com',
  password: '[REDACTED]',
  token: '[REDACTED]'
}
```

## Global Error Handlers

Setup handlers for unhandled errors:

```typescript
import {
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} from '@eazepay/error-handler';

// Handle unhandled promise rejections
setupUnhandledRejectionHandler(logger);

// Handle uncaught exceptions
setupUncaughtExceptionHandler(logger);
```

## Best Practices

### 1. Use Specific Error Classes

```typescript
// Good
throw new NotFoundError('User not found');

// Avoid
throw new Error('User not found');
```

### 2. Add Context

```typescript
// Good
throw new NotFoundError('User not found', 'user');

// Better
throw new ValidationError('Invalid input', [
  { field: 'email', message: 'Invalid format' }
]);
```

### 3. Wrap Async Handlers

```typescript
// Good
router.get('/users', asyncHandler(async (req, res) => {
  // ...
}));

// Avoid
router.get('/users', async (req, res) => {
  try {
    // ...
  } catch (error) {
    // Manual error handling
  }
});
```

### 4. Use Operational Errors

```typescript
// For expected errors (user input, not found, etc.)
throw new NotFoundError('Resource not found');

// For unexpected errors (bugs, system failures)
throw new InternalServerError('Unexpected error');
```

## Testing

```typescript
import { NotFoundError, ValidationError } from '@eazepay/error-handler';

describe('Error Handling', () => {
  it('should throw NotFoundError', () => {
    expect(() => {
      throw new NotFoundError('User not found');
    }).toThrow(NotFoundError);
  });

  it('should have correct status code', () => {
    const error = new NotFoundError('User not found');
    expect(error.statusCode).toBe(404);
  });

  it('should include details', () => {
    const error = new ValidationError('Validation failed', [
      { field: 'email', message: 'Invalid' }
    ]);
    expect(error.details).toBeDefined();
  });
});
```

## Migration Guide

### Before

```typescript
// Inconsistent error handling
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

### After

```typescript
import { asyncHandler, NotFoundError } from '@eazepay/error-handler';

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found', 'user');
  }
  res.json({ user });
}));
```

## Support

For issues or questions:
1. Check this README
2. Review error logs
3. Check error response format
4. Contact DevOps team

---

**Version**: 1.0.0  
**License**: MIT  
**Maintained By**: Eazepay DevOps Team
