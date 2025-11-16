import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { AgentController } from './controllers/AgentController';
import { authenticate } from '../../shared/auth-middleware/src/middleware/authenticate';
import { requireRole } from '../../shared/auth-middleware/src/middleware/authorize';
import { validateBody } from '../../shared/validation/src/middleware/validate';
import { errorHandler } from '../../shared/error-handler/src/middleware/errorHandler';
import Joi from 'joi';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

const agentController = new AgentController();

// Validation schemas
const registerCustomerSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^254[17]\d{8}$/).required(),
  fullName: Joi.string().min(2).max(100).required(),
  nationalId: Joi.string().required(),
  email: Joi.string().email().optional(),
  biometricData: Joi.array().items(Joi.object({
    type: Joi.string().valid('fingerprint', 'palm').required(),
    fingerType: Joi.string().valid('thumb', 'index', 'middle', 'ring', 'pinky').when('type', {
      is: 'fingerprint',
      then: Joi.required()
    }),
    hand: Joi.string().valid('left', 'right').required(),
    data: Joi.string().base64().required()
  })).min(1).required(),
  primaryFingerIndex: Joi.number().integer().min(0).required()
});

const verifyCustomerSchema = Joi.object({
  biometricData: Joi.string().base64().required()
});

const cashTransactionSchema = Joi.object({
  biometricData: Joi.string().base64().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().required()
});

// Health check
app.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  service: 'agent-service',
  timestamp: new Date().toISOString()
}));

// Register new customer (agent only)
app.post('/api/agent/register-customer',
  authenticate,
  requireRole('AGENT'),
  validateBody(registerCustomerSchema),
  (req, res) => agentController.registerCustomer(req, res)
);

// Verify customer biometric
app.post('/api/agent/verify-customer',
  authenticate,
  requireRole('AGENT'),
  validateBody(verifyCustomerSchema),
  (req, res) => agentController.verifyCustomer(req, res)
);

// Process cash-in (customer deposits cash)
app.post('/api/agent/cash-in',
  authenticate,
  requireRole('AGENT'),
  validateBody(cashTransactionSchema),
  (req, res) => agentController.processCashIn(req, res)
);

// Process cash-out (customer withdraws cash)
app.post('/api/agent/cash-out',
  authenticate,
  requireRole('AGENT'),
  validateBody(cashTransactionSchema),
  (req, res) => agentController.processCashOut(req, res)
);

// Get agent statistics
app.get('/api/agent/stats',
  authenticate,
  requireRole('AGENT'),
  (req, res) => agentController.getAgentStats(req, res)
);

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 8005;
app.listen(port, () => {
  console.log(`✅ Agent service listening securely on http://localhost:${port}`);
});
