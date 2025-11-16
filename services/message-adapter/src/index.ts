import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { buildPain001Xml, Pain001Payload } from './iso20022/pain001';
import { buildPacs008Xml, Pacs008Payload } from './iso20022/pacs008';

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
const validatePain001 = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { messageId, initiatingParty, payments } = req.body;
  
  if (!messageId || !initiatingParty || !Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: messageId, initiatingParty, and payments array required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

const validatePacs008 = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { messageId, instructionId, endToEndId, amount, currency } = req.body;
  
  if (!messageId || !instructionId || !endToEndId || !amount || !currency) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: messageId, instructionId, endToEndId, amount, and currency required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'message-adapter' }));

app.post('/api/iso/pain001', internalAuth, validatePain001, (req, res) => {
  try {
    const payload = req.body as Pain001Payload;
    const xml = buildPain001Xml(payload);
    res.type('application/xml').send(xml);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate pain.001 message',
      code: 'GENERATION_ERROR'
    });
  }
});

app.post('/api/iso/pacs008', internalAuth, validatePacs008, (req, res) => {
  try {
    const payload = req.body as Pacs008Payload;
    const xml = buildPacs008Xml(payload);
    res.type('application/xml').send(xml);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate pacs.008 message',
      code: 'GENERATION_ERROR'
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

const port = process.env.PORT || 8011;
app.listen(port, () => {
  console.log(`✅ message-adapter listening securely on http://localhost:${port}`);
});