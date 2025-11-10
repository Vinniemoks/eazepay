export type PaymentRequest = {
  idempotencyKey: string;
  amount: number;
  currency: string;
  sourceAccount?: string;
  destinationAccount?: string;
  beneficiary?: {
    name?: string;
    account?: string;
    bankCode?: string;
    country?: string;
  };
  corridor?: string; // e.g., NG->EU
  metadata?: Record<string, string>;
};

export type PaymentResponse = {
  status: 'accepted' | 'processing' | 'completed' | 'failed';
  reference: string;
  provider?: string;
  message?: string;
};

export type PaymentStatus = {
  reference: string;
  status: 'processing' | 'completed' | 'failed';
  raw?: unknown;
};

export interface RailConnector {
  readonly name: string;
  readonly capabilities: {
    currencies: string[];
    corridors: string[];
    supportsInstant: boolean;
  };
  initiatePayment(req: PaymentRequest): Promise<PaymentResponse>;
  getPaymentStatus(reference: string): Promise<PaymentStatus>;
  refund?(reference: string, amount?: number): Promise<PaymentResponse>;
}