import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { proxyRoutes } from './routes/proxy';
import { correlationId } from './middleware/correlationId';

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.length === 0 || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  exposedHeaders: ['X-Correlation-ID']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json());

// Ensure every request has an X-Correlation-ID and attach it
app.use(correlationId);

// Request logging (includes correlation id)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const correlationId = req.headers['x-correlation-id'] || '-';
    console.log(`[gateway] cid=${correlationId} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Proxy mounts
app.use('/api/auth', proxyRoutes.auth);
app.use('/api/admin', proxyRoutes.admin);
app.use('/api/transactions', proxyRoutes.transactions);
app.use('/api/wallet', proxyRoutes.wallet);
app.use('/api/biometric', proxyRoutes.biometric);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 API Gateway running on http://localhost:${config.port}`);
});