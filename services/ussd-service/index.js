const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('./utils/logger');
const { JWTService, initializeAuth, authenticate } = require('@afripay/auth-middleware');
const { validateRequest, joi } = require('@afripay/validation');
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: process.env.BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '1mb' }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
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
  client: redis,
  prefix: 'rl:ussd:'
});
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore,
});
app.use(apiRateLimit);
const ussdController = require('./ussdController');

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ussd-service' });
});

// Initialize authentication and protect API routes
const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: '8h',
  issuer: 'afripay-services',
  audience: 'afripay-services'
});
initializeAuth(jwtService);
app.use('/api', authenticate);

// Validate USSD request payload
const ussdSchema = joi.object({
  sessionId: joi.string().min(6).max(128).required(),
  serviceCode: joi.string().min(1).max(32).required(),
  phoneNumber: joi.string().min(6).max(20).required(),
  text: joi.string().allow('').max(1024).required(),
  network: joi.string().optional(),
  channel: joi.string().optional()
});

app.post('/api/ussd', validateRequest(ussdSchema), ussdController.handleUssdRequest);

module.exports = app;
