import { RailConnector, PaymentRequest, PaymentResponse, PaymentStatus } from '../types/RailConnector';

export class MobileMoneyConnector implements RailConnector {
  readonly name = 'mobile-money';
  readonly capabilities = {
    currencies: ['NGN', 'GHS', 'KES', 'TZS', 'UGX'],
    corridors: ['NG->NG', 'NG->KE', 'NG->GH'],
    supportsInstant: true
  };

  async initiatePayment(req: PaymentRequest): Promise<PaymentResponse> {
    if (!['NGN', 'GHS', 'KES', 'TZS', 'UGX'].includes(req.currency)) {
      return { status: 'failed', reference: req.idempotencyKey, message: 'Currency not supported' };
    }
    if (!req.beneficiary?.account) {
      return { status: 'failed', reference: req.idempotencyKey, message: 'Missing beneficiary account' };
    }
    return {
      status: 'accepted',
      reference: `MM-${req.idempotencyKey}`,
      provider: this.name,
      message: 'Accepted by Mobile Money mock connector'
    };
  }

  async getPaymentStatus(reference: string): Promise<PaymentStatus> {
    return { reference, status: 'processing', raw: { provider: this.name } };
  }
}