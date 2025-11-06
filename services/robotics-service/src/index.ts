// Robotics Service - Main Entry Point
import express, { Request, Response } from 'express';
import { JWTService, initializeAuth, authenticate } from '@afripay/auth-middleware';
import { validateRequest, joi } from '@afripay/validation';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8040;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize authentication
const jwtService = new JWTService({
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: '8h',
  issuer: 'afripay-services',
  audience: 'afripay-services'
});
initializeAuth(jwtService);

// Protect API routes (keep /health public)
app.use('/api', authenticate);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'robotics-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Placeholder endpoints
const kioskRegisterSchema = joi.object({
  kioskId: joi.string().uuid().required(),
  location: joi.string().min(2).max(256).required(),
  meta: joi.object().optional()
});
app.post('/api/kiosks/register', validateRequest(kioskRegisterSchema), async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Kiosk registration endpoint' });
});

const rpaJobSchema = joi.object({
  jobName: joi.string().min(2).max(128).required(),
  payload: joi.object().required(),
  priority: joi.string().valid('low','medium','high').default('medium')
});
app.post('/api/rpa/jobs', validateRequest(rpaJobSchema), async (req: Request, res: Response) => {
  res.json({ success: true, message: 'RPA job creation endpoint' });
});

const kycProcessSchema = joi.object({
  customerId: joi.string().uuid().required(),
  documentType: joi.string().min(2).max(64).required(),
  fileUrl: joi.string().uri().required()
});
app.post('/api/documents/kyc/process', validateRequest(kycProcessSchema), async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Document processing endpoint' });
});

const biometricEnrollSchema = joi.object({
  customerId: joi.string().uuid().required(),
  biometricType: joi.string().valid('fingerprint','face','iris','voice').required(),
  data: joi.string().min(10).required()
});
app.post('/api/biometric/enroll', validateRequest(biometricEnrollSchema), async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Biometric enrollment endpoint' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🦾 Eazepay Robotics Service                        ║
║                                                       ║
║   Version: 1.0.0                                     ║
║   Port: ${PORT}                                        ║
║   Status: Running ✅                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
