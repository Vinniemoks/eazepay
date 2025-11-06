// Standard event types across the system

export enum EventType {
  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_VERIFIED = 'user.verified',
  
  // Transaction events
  TRANSACTION_CREATED = 'transaction.created',
  TRANSACTION_COMPLETED = 'transaction.completed',
  TRANSACTION_FAILED = 'transaction.failed',
  TRANSACTION_REVERSED = 'transaction.reversed',
  
  // Payment events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  
  // Wallet events
  WALLET_CREATED = 'wallet.created',
  WALLET_CREDITED = 'wallet.credited',
  WALLET_DEBITED = 'wallet.debited',
  WALLET_FROZEN = 'wallet.frozen',
  
  // Biometric events
  BIOMETRIC_ENROLLED = 'biometric.enrolled',
  BIOMETRIC_VERIFIED = 'biometric.verified',
  BIOMETRIC_FAILED = 'biometric.failed',
  
  // Agent events
  AGENT_REGISTERED = 'agent.registered',
  AGENT_ACTIVATED = 'agent.activated',
  AGENT_SUSPENDED = 'agent.suspended',
  
  // Audit events
  AUDIT_LOG_CREATED = 'audit.log.created',
  
  // System events
  SERVICE_STARTED = 'service.started',
  SERVICE_STOPPED = 'service.stopped',
  HEALTH_CHECK_FAILED = 'health.check.failed'
}

export interface UserCreatedEvent {
  userId: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface TransactionCompletedEvent {
  transactionId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  type: string;
  completedAt: string;
}

export interface PaymentInitiatedEvent {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  initiatedAt: string;
}

export interface WalletCreditedEvent {
  walletId: string;
  userId: string;
  amount: number;
  currency: string;
  transactionId: string;
  creditedAt: string;
}
