// Financial Service Entry Point
import express from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
// @ts-ignore
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// Security & production settings
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: process.env.BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '1mb' }));

// CORS with allowlist
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting (Redis-backed if available)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});
const useRedis = !!process.env.REDIS_HOST;
const limiterStore = useRedis ? new RedisStore({
  // @ts-ignore
  client: redis,
  prefix: 'rl:fin:'
}) : undefined;

const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore as any,
});
app.use(apiRateLimit);
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'financial-service',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'FIN_001'
  });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');

    const server = http.createServer(app);
    const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '30000');
    const HEADERS_TIMEOUT_MS = parseInt(process.env.HEADERS_TIMEOUT_MS || '35000');
    const KEEP_ALIVE_TIMEOUT_MS = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS || '5000');
    // @ts-ignore
    server.requestTimeout = REQUEST_TIMEOUT_MS;
    // @ts-ignore
    server.headersTimeout = HEADERS_TIMEOUT_MS;
    // @ts-ignore
    server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;

    server.listen(PORT, () => {
      console.log(`Financial Service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;
