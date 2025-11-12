// Identity Service Main Application
// Phase 2: Identity & Authentication Service

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { initializeDatabase, closeDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import { apiRateLimit } from './middleware/rateLimit';
import { randomUUID } from 'crypto'; // For correlation ID

// Load environment variables
dotenv.config();

const app: Application = express();
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  exposedHeaders: ['X-Correlation-ID', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
};
app.use(cors(corsOptions));
// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
const PORT = process.env.PORT || 8000;
const SKIP_DB_INIT = (process.env.SKIP_DB_INIT || 'false').toLowerCase() === 'true';

// Security middleware
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add correlation ID to all requests
// This should ideally be handled by the API Gateway and propagated.
// For direct service access, we generate one here.
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || randomUUID();
  res.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string);
  next();
});

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] as string;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      service: 'identity-service'
    });
  });
  res.on('close', () => {
    // Handle cases where the connection is closed before response is sent
  });
  next();
});

// Apply rate limiting
app.use(apiRateLimit);

// Routes
import adminRoutes from './routes/admin.routes';
import superuserRoutes from './routes/superuser.routes';
import accessRequestRoutes from './routes/accessRequest.routes';

// HSM status (for informational purposes)
const hsmEnabled = (process.env.HSM_ENABLED || 'false').toLowerCase() === 'true';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superuser', superuserRoutes);
app.use('/api/access-requests', accessRequestRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Eazepay Identity Service',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    mode: process.env.SERVICE_MODE || 'integrated',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      superuser: '/api/superuser',
      accessRequests: '/api/access-requests',
      health: '/health',
      hsmStatus: hsmEnabled ? 'enabled' : 'disabled'
    }
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'identity-service',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    hsmStatus: hsmEnabled ? 'enabled' : 'disabled'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    code: 'SYS_404',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const correlationId = req.headers['x-correlation-id'] as string;
  logger.error('Unhandled error', {
    correlationId,
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ // Use logger here
    error: 'Internal server error',
    code: 'SYS_002',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    correlationId: req.headers['x-correlation-id']
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database unless explicitly skipped
    if (!SKIP_DB_INIT) {
      await initializeDatabase();
      // Start background jobs only when DB is initialized
      const { AccessRequestExpiryJob } = await import('./jobs/expireAccessRequests');
      AccessRequestExpiryJob.startScheduler();
    } else {
      console.log('⚠️  SKIP_DB_INIT=true — starting without database initialization or background jobs');
    }
    
    // Start listening
    app.listen(PORT, () => {
      const dbStatus = SKIP_DB_INIT ? 'Skipped ⚠️' : 'Connected ✅'; // Use logger here
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Eazepay Identity Service                        ║
║                                                       ║
║   Version: 2.0.0                                     ║
║   Port: ${PORT}                                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   Database: ${dbStatus}                              ║
║   HSM for JWT: ${hsmEnabled ? 'Enabled ✅' : 'Disabled ❌'}                         ║
║                                                       ║
║   Endpoints:                                         ║
║   Auth:                                              ║
║   - POST /api/auth/register                          ║
║   - POST /api/auth/login                             ║
║   - POST /api/auth/verify-2fa                        ║
║   Superuser:                                         ║
║   - POST /api/superuser/create                       ║
║   - GET  /api/superuser/list                         ║
║   - DELETE /api/superuser/:userId/revoke             ║
║   Admin:                                             ║
║   - POST /api/admin/users                            ║
║   - GET  /api/admin/organization/hierarchy           ║
║   Access Requests:                                   ║
║   - POST /api/access-requests                        ║
║   - GET  /api/access-requests/pending                ║
║   - POST /api/access-requests/:id/approve            ║
║   - GET  /health                                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;
