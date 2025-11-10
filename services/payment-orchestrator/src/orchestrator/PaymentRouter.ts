import { RailConnector, PaymentRequest, PaymentResponse } from '../types/RailConnector';

type RoutePolicy = {
  preferred?: string[]; // connector names
  instantRequired?: boolean;
  corridor?: string;
};

export class PaymentRouter {
  private connectors: RailConnector[] = [];

  register(connector: RailConnector) {
    this.connectors.push(connector);
  }

  async routePayment(req: PaymentRequest, policy?: RoutePolicy): Promise<PaymentResponse> {
    const candidates = this.selectCandidates(req, policy);
    if (candidates.length === 0) {
      return { status: 'failed', reference: req.idempotencyKey, message: 'No available connectors for request' };
    }

    for (const connector of candidates) {
      try {
        const resp = await connector.initiatePayment(req);
        if (resp.status !== 'failed') return resp;
      } catch (err) {
        // try next candidate
        continue;
      }
    }
    return { status: 'failed', reference: req.idempotencyKey, message: 'All connectors failed' };
  }

  private selectCandidates(req: PaymentRequest, policy?: RoutePolicy): RailConnector[] {
    let list = this.connectors.filter(c => c.capabilities.currencies.includes(req.currency));
    if (policy?.corridor) {
      list = list.filter(c => c.capabilities.corridors.includes(policy.corridor!));
    }
    if (policy?.instantRequired) {
      list = list.filter(c => c.capabilities.supportsInstant);
    }
    if (policy?.preferred && policy.preferred.length > 0) {
      const preferredSet = new Set(policy.preferred);
      const preferred = list.filter(c => preferredSet.has(c.name));
      const others = list.filter(c => !preferredSet.has(c.name));
      return [...preferred, ...others];
    }
    return list;
  }
}