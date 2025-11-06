// Validation middleware - now using shared @afripay/validation
// This file delegates to the shared validation library

export { 
  validateBody as validateTransaction,
  validateQuery,
  validateParams,
  validateRequest,
  sanitize
} from '@afripay/validation';

// Export common schemas for use in routes
export { schemas, commonSchemas } from '@afripay/validation';
