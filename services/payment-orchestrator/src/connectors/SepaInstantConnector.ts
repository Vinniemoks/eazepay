import { RailConnector, PaymentRequest, PaymentResponse, PaymentStatus } from '../types/RailConnector';

export class SepaInstantConnector implements RailConnector {
  readonly name = 'sepa-instant';
  readonly capabilities = {
    currencies: ['EUR'],
    corridors: ['EU->EU', 'NG->EU', 'US->EU'],
    supportsInstant: true
  };

  async initiatePayment(req: PaymentRequest): Promise<PaymentResponse> {
    // Placeholder: call partner API here
    if (req.currency !== 'EUR') {
      return { status: 'failed', reference: req.idempotencyKey, message: 'Currency not supported' };
    }
    return {
      status: 'accepted',
      reference: `SEPA-${req.idempotencyKey}`,
      provider: this.name,
      message: 'Accepted by SEPA Instant mock connector'
    };
  }

  async getPaymentStatus(reference: string): Promise<PaymentStatus> {
    // Placeholder: poll partner API for status
    return { reference, status: 'processing', raw: { provider: this.name } };
  }

  async refund(reference: string, amount?: number): Promise<PaymentResponse> {
    return { status: 'accepted', reference: `${reference}-refund`, provider: this.name, message: `Refund ${amount ?? 'full'}` };
  }
}