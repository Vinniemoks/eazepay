import express from 'express';
import { v4 as uuid } from 'uuid';
import { PaymentRouter } from './orchestrator/PaymentRouter';
import { SepaInstantConnector } from './connectors/SepaInstantConnector';
import { MobileMoneyConnector } from './connectors/MobileMoneyConnector';
import { PaymentRequest } from './types/RailConnector';

// Initialize router (connectors will be registered separately)
const router = new PaymentRouter();
// Register default connectors
router.register(new SepaInstantConnector());
router.register(new MobileMoneyConnector());

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/orchestrate/payment', async (req, res) => {
  const body = req.body as Partial<PaymentRequest>;
  const idempotencyKey = body.idempotencyKey || uuid();
  const payload: PaymentRequest = {
    idempotencyKey,
    amount: body.amount || 0,
    currency: body.currency || 'NGN',
    sourceAccount: body.sourceAccount,
    destinationAccount: body.destinationAccount,
    beneficiary: body.beneficiary,
    corridor: body.corridor,
    metadata: body.metadata || {}
  };

  try {
    const response = await router.routePayment(payload, {
      corridor: payload.corridor,
      instantRequired: true
    });
    res.status(response.status === 'failed' ? 400 : 200).json(response);
  } catch (err) {
    res.status(500).json({ status: 'failed', reference: idempotencyKey, message: 'Unexpected error' });
  }
});

const port = process.env.PORT || 8010;
app.listen(port, () => {
  console.log(`payment-orchestrator listening on http://localhost:${port}`);
});