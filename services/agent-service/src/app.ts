import 'reflect-metadata';
import express from 'express';
import http from 'http';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
// @ts-ignore
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { AgentDataSource } from './config/database';
import { agentRoutes } from './routes/agentRoutes';
import { terminalRoutes } from './routes/terminalRoutes';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger, logger } from './utils/logger';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: process.env.BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '1mb' }));

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

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});
const limiterStore = new RedisStore({
  // @ts-ignore
  client: redis,
  prefix: 'rl:agent:'
});
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore as any,
});
app.use(apiRateLimit);
const PORT = process.env.PORT || 8005;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'agent-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/agents', agentRoutes);
app.use('/api/terminals', terminalRoutes);

app.use(errorHandler);

// ...existing code...

if (process.env.NODE_ENV !== 'test') {
  AgentDataSource.initialize()
    .then(() => {
      logger.info('Agent service connected to database');
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
        logger.info(`Agent Service listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      logger.error('Failed to initialise data source', error);
      process.exit(1);
    });
}

export default app;