// Authentication routes
// Phase 2: Identity & Authentication Service

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { SessionController } from '../controllers/SessionController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const authController = new AuthController();
const sessionController = new SessionController();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).max(255).required(),
  role: Joi.string().valid('CUSTOMER', 'AGENT').required(),
  verificationType: Joi.string().valid('PASSPORT', 'NATIONAL_ID', 'HUDUMA').required(),
  verificationNumber: Joi.string().required(),
  businessDetails: Joi.object().when('role', {
    is: 'AGENT',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verify2FASchema = Joi.object({
  sessionToken: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).optional(),
  biometricData: Joi.object().optional()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/verify-2fa', validateRequest(verify2FASchema), authController.verify2FA);

// Session management
router.post('/session/refresh', validateRequest(refreshTokenSchema), sessionController.refreshToken);
router.get('/sessions', authenticate, sessionController.getUserSessions);
router.delete('/sessions/:sessionId', authenticate, sessionController.revokeSession);
router.post('/sessions/revoke-all', authenticate, sessionController.revokeAllSessions);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'identity-service', timestamp: new Date().toISOString() });
});

export default router;
