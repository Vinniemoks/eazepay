// Financial Service Entry Point
import express from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
// @ts-ignore
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import transactionRoutes from './routes/transaction.routes';
import analyticsRoutes from './routes/analytics.routes';
import logger from './utils/logger';
import { setupSwagger } from './utils/swagger';
import {
  errorHandler,
  notFoundHandler,
  initializeErrorHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler
} from './middleware/error-handler';

const app = express();

// Initialize error handler
initializeErrorHandler(logger);
setupUnhandledRejectionHandler(logger);
setupUncaughtExceptionHandler(logger);
logger.info('Error handler initialized');

// Authentication is handled per-route via internal API key middleware
logger.info('Authentication middleware initialized (local)');

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
const useRedis = process.env.USE_REDIS_RATE_LIMIT === 'true' && !!process.env.REDIS_HOST;
const redis = useRedis
  ? new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    })
  : undefined;
const limiterStore = useRedis
  ? new RedisStore({
      // @ts-ignore
      client: redis,
      prefix: 'rl:fin:',
    })
  : undefined;

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
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API Documentation
setupSwagger(app, {
  serviceName: 'Eazepay Financial Service API',
  serviceDescription: 'Financial transaction and analytics service for Eazepay platform',
  version: '1.0.0',
  basePath: '/api',
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server'
    },
    {
      url: 'https://api.eazepay.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Transactions',
      description: 'Transaction management endpoints'
    },
    {
      name: 'Analytics',
      description: 'Financial analytics and reporting'
    },
    {
      name: 'Health',
      description: 'Service health check'
    }
  ],
  apiFiles: ['./src/routes/**/*.ts']
});

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'financial-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
(async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
  } catch (error: any) {
    logger.error('Failed to initialize database', {
      error: error?.message,
      stack: error?.stack
    });
  }

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
    logger.info('Financial Service started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
  });
})();

export default app;
