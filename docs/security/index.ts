import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import logger from '@eazepay/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;

app.use(express.json());

// --- Middleware for Correlation ID ---
app.use((req: Request, res: Response, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', correlationId as string);
  (req as any).correlationId = correlationId; // Attach to request for logging
  next();
});

// --- Request Logging ---
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      correlationId: (req as any).correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      service: 'biometric-service',
    });
  });
  next();
});

// --- Routes ---

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'biometric-service',
    timestamp: new Date().toISOString(),
  });
});

// Liveness check endpoint
app.post('/api/biometric/check-liveness', (req: Request, res: Response) => {
  const { biometricData } = req.body;

  if (!biometricData) {
    logger.warn('Missing biometric data for liveness check', { correlationId: (req as any).correlationId });
    return res.status(400).json({ message: 'Missing biometric data' });
  }

  // Simulate liveness check
  const isLive = Math.random() > 0.2; // 80% chance of success

  logger.info(`Liveness check result: ${isLive}`, { correlationId: (req as any).correlationId });

  if (isLive) {
    res.status(200).json({ live: true, message: 'Liveness check passed' });
  } else {
    res.status(403).json({ live: false, message: 'Liveness check failed' });
  }
});

app.listen(PORT, () => {
  logger.info(`Biometric Service running on port ${PORT}`);
});

export default app;