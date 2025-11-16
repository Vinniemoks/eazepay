import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { parseCamt053 } from './parser/StatementParser';
import { reconcile } from './recon/Reconciler';

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

app.use(express.json({ limit: '2mb' }));

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
const validateReconRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { statementXml, ledger } = req.body;
  
  if (!statementXml || typeof statementXml !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: statementXml (string) required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  if (!Array.isArray(ledger) || ledger.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: ledger (non-empty array) required',
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Validate ledger entries
  for (const entry of ledger) {
    if (!entry.reference || typeof entry.amount !== 'number' || !entry.currency) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ledger entry: reference, amount (number), and currency required',
        code: 'VALIDATION_ERROR'
      });
    }
  }
  
  next();
};

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'recon-service' }));

app.post('/api/recon/run', internalAuth, validateReconRequest, (req, res) => {
  try {
    const { statementXml, ledger } = req.body as { 
      statementXml: string; 
      ledger: Array<{ reference: string; amount: number; currency: string }> 
    };
    
    const parsed = parseCamt053(statementXml);
    const result = reconcile(parsed, ledger);
    
    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Reconciliation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Reconciliation failed',
      code: 'RECONCILIATION_ERROR'
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

const port = process.env.PORT || 8012;
app.listen(port, () => {
  console.log(`✅ recon-service listening securely on http://localhost:${port}`);
});