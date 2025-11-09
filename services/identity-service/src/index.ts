// Identity Service Main Application
// Phase 2: Identity & Authentication Service

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import { apiRateLimit } from './middleware/rateLimit';
import { generateCorrelationId } from './utils/security';

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
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || generateCorrelationId();
  res.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string);
  next();
});

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Apply rate limiting
app.use(apiRateLimit);

// Routes
import adminRoutes from './routes/admin.routes';
import superuserRoutes from './routes/superuser.routes';
import accessRequestRoutes from './routes/accessRequest.routes';

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
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'identity-service',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    code: 'SYS_404',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
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
      const dbStatus = SKIP_DB_INIT ? 'Skipped ⚠️' : 'Connected ✅';
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Eazepay Identity Service                        ║
║                                                       ║
║   Version: 2.0.0                                     ║
║   Port: ${PORT}                                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║   Database: ${dbStatus}                              ║
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;
