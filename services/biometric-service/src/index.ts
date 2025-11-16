import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { BiometricController } from './controllers/BiometricController';
import { authenticate } from '../../shared/auth-middleware/src/middleware/authenticate';
import { validateBody } from '../../shared/validation/src/middleware/validate';
import { biometricEnrollmentSchema, biometricVerificationSchema } from './validation/schemas';
import { errorHandler } from '../../shared/error-handler/src/middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
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

app.use(express.json({ limit: '10mb' })); // Larger limit for biometric data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const biometricController = new BiometricController();

// Health check
app.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  service: 'biometric-service',
  timestamp: new Date().toISOString()
}));

// Public endpoint for agent registration (requires agent authentication)
app.post('/api/biometric/agent/register',
  authenticate,
  validateBody(biometricEnrollmentSchema),
  (req, res) => biometricController.agentRegisterUser(req, res)
);

// Enroll fingerprint (user or agent)
app.post('/api/biometric/enroll/fingerprint',
  authenticate,
  validateBody(biometricEnrollmentSchema),
  (req, res) => biometricController.enrollFingerprint(req, res)
);

// Enroll palm print
app.post('/api/biometric/enroll/palm',
  authenticate,
  validateBody(biometricEnrollmentSchema),
  (req, res) => biometricController.enrollPalm(req, res)
);

// Verify biometric for payment
app.post('/api/biometric/verify',
  authenticate,
  validateBody(biometricVerificationSchema),
  (req, res) => biometricController.verifyBiometric(req, res)
);

// Check for duplicate biometrics (fraud detection)
app.post('/api/biometric/check-duplicate',
  authenticate,
  (req, res) => biometricController.checkDuplicate(req, res)
);

// Get user's enrolled biometrics
app.get('/api/biometric/user/:userId',
  authenticate,
  (req, res) => biometricController.getUserBiometrics(req, res)
);

// Sync biometrics from mobile device
app.post('/api/biometric/sync',
  authenticate,
  (req, res) => biometricController.syncFromMobile(req, res)
);

// Delete biometric template
app.delete('/api/biometric/:templateId',
  authenticate,
  (req, res) => biometricController.deleteBiometric(req, res)
);

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`✅ Biometric service listening securely on http://localhost:${port}`);
});
