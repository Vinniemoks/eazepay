import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Internal service authentication middleware
const internalAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-internal-api-key'] as string;
  const validKey = process.env.INTERNAL_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Internal service only',
      code: 'FORBIDDEN'
    });
  }
  next();
};

// Input validation middleware
const validatePaymentRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { amount, currency, sourceAccount, destinationAccount } = req.body;
  
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: amount must be a positive number',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: currency must be a 3-letter code',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!sourceAccount || !destinationAccount) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: sourceAccount and destinationAccount required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'payment-orchestrator' }));

app.post('/api/orchestrate/payment', internalAuth, validatePaymentRequest, async (req, res) => {
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
    res.status(response.status === 'failed' ? 400 : 200).json({
      success: response.status !== 'failed',
      ...response
    });
  } catch (err: any) {
    console.error('Payment orchestration error:', err.message);
    res.status(500).json({ 
      success: false,
      status: 'failed', 
      reference: idempotencyKey, 
      message: 'Payment orchestration failed',
      code: 'ORCHESTRATION_ERROR'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

const port = process.env.PORT || 8010;
app.listen(port, () => {
  console.log(`✅ payment-orchestrator listening securely on http://localhost:${port}`);
});