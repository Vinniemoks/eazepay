import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { authRateLimit, twoFARateLimit } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  verify2FASchema
} from '../validation/auth.schemas';

const router = Router();
const authController = new AuthController();

// Local rate limiters
const authLimiter = authRateLimit;
const twoFALimiter = twoFARateLimit;

/**
 * Register new user
 * Rate limited to prevent spam registrations
 */
router.post('/register',
  authLimiter,
  validateRequest(registerSchema),
  (req, res) => authController.register(req, res)
);

/**
 * Login with credentials
 * Rate limited to prevent brute force attacks
 */
router.post('/login',
  authLimiter,
  validateRequest(loginSchema),
  (req, res) => authController.login(req, res)
);

/**
 * Verify 2FA
 * Rate limited to prevent OTP guessing
 */
router.post('/verify-2fa',
  twoFALimiter,
  validateRequest(verify2FASchema),
  (req, res) => authController.verify2FA(req, res)
);

export { router as authRoutes };