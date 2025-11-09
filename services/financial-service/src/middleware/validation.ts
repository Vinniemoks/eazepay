// Validation middleware - now using shared @eazepay/validation
// This file delegates to the shared validation library

export { 
  validateBody as validateTransaction,
  validateQuery,
  validateParams,
  validateRequest,
  sanitize
} from '@eazepay/validation';

// Export common schemas for use in routes
export { schemas, commonSchemas } from '@eazepay/validation';
