import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { 
  createAuthRateLimiter, 
  create2FALimiter 
} from '@afripay/auth-middleware';
import redisClient from '../config/redis';
import {
  registerSchema,
  loginSchema,
  verify2FASchema
} from '../validation/auth.schemas';

const router = Router();
const authController = new AuthController();

// Create rate limiters
const authLimiter = createAuthRateLimiter(redisClient);
const twoFALimiter = create2FALimiter(redisClient);

/**
 * Register new user
 * Rate limited to prevent spam registrations
 */
router.post('/register',
  authLimiter.middleware(),
  validateRequest(registerSchema),
  (req, res) => authController.register(req, res)
);

/**
 * Login with credentials
 * Rate limited to prevent brute force attacks
 */
router.post('/login',
  authLimiter.middleware(),
  validateRequest(loginSchema),
  (req, res) => authController.login(req, res)
);

/**
 * Verify 2FA
 * Rate limited to prevent OTP guessing
 */
router.post('/verify-2fa',
  twoFALimiter.middleware(),
  validateRequest(verify2FASchema),
  (req, res) => authController.verify2FA(req, res)
);

export { router as authRoutes };