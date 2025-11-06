import { Router } from 'express';
import { AuthEnhancedController } from '../controllers/AuthEnhancedController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  createAuthRateLimiter, 
  createPasswordResetLimiter, 
  create2FALimiter 
} from '@afripay/auth-middleware';
import redisClient from '../config/redis';
import {
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  resendOTPSchema,
  sessionIdSchema
} from '../validation/auth.schemas';

const router = Router();
const controller = new AuthEnhancedController();

// Create rate limiters
const authLimiter = createAuthRateLimiter(redisClient);
const passwordResetLimiter = createPasswordResetLimiter(redisClient);
const twoFALimiter = create2FALimiter(redisClient);

/**
 * Token refresh endpoint (rate limited)
 */
router.post('/refresh',
  authLimiter.middleware(),
  validateRequest(refreshTokenSchema),
  controller.refreshToken.bind(controller)
);

/**
 * Logout endpoint
 */
router.post('/logout',
  authenticate,
  controller.logout.bind(controller)
);

/**
 * Logout from all devices
 */
router.post('/logout-all',
  authenticate,
  controller.logoutAll.bind(controller)
);

/**
 * Get active sessions
 */
router.get('/sessions',
  authenticate,
  controller.getSessions.bind(controller)
);

/**
 * Revoke specific session
 */
router.delete('/sessions/:sessionId',
  authenticate,
  (req, res, next) => {
    const { error } = sessionIdSchema.validate({ sessionId: req.params.sessionId });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID format',
        code: 'INVALID_SESSION_ID'
      });
    }
    next();
  },
  controller.revokeSession.bind(controller)
);

/**
 * Password reset request (rate limited)
 */
router.post('/forgot-password',
  passwordResetLimiter.middleware(),
  validateRequest(forgotPasswordSchema),
  controller.forgotPassword.bind(controller)
);

/**
 * Password reset confirmation (rate limited)
 */
router.post('/reset-password',
  passwordResetLimiter.middleware(),
  validateRequest(resetPasswordSchema),
  controller.resetPassword.bind(controller)
);

/**
 * Verify 2FA with OTP (rate limited)
 */
router.post('/verify-2fa',
  twoFALimiter.middleware(),
  validateRequest(verify2FASchema),
  controller.verify2FA.bind(controller)
);

/**
 * Resend OTP (rate limited)
 */
router.post('/resend-otp',
  twoFALimiter.middleware(),
  validateRequest(resendOTPSchema),
  controller.resendOTP.bind(controller)
);

export default router;
