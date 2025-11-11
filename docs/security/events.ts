/**
 * Standardized event types for the Eazepay platform.
 */
export enum EventType {
  // User-related events
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.loggedin',

  // Transaction-related events
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
}