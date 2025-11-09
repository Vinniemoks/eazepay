import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { SessionManager, JWTService } from '@eazepay/auth-middleware';
import {
  hashPassword,
  verifyPassword,
  generateOTP,
  sendSMS
} from '../utils/security';
import redisClient from '../config/redis';
import emailService from '../config/email';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export class AuthEnhancedController {
  private sessionManager: SessionManager;
  private jwtService: JWTService;

  constructor() {
    // Initialize session manager with existing Redis client
    this.sessionManager = new SessionManager(redisClient, 28800); // 8 hours

    // Initialize JWT service
    this.jwtService = new JWTService({
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: '8h',
      issuer: 'eazepay-identity-service',
      audience: 'eazepay-services'
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const payload = this.jwtService.verifyToken(refreshToken);

      if (payload.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Validate session
      const isValidSession = await this.sessionManager.validateSession(payload.sessionId);
      if (!isValidSession) {
        return res.status(401).json({
          success: false,
          error: 'Session expired',
          code: 'SESSION_EXPIRED'
        });
      }

      // Get user to include latest permissions
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: payload.userId },
        relations: ['permissions']
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate new access token
      const newAccessToken = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: payload.sessionId,
        permissions: user.permissions || []
      });

      logger.info('Token refreshed', { userId: user.id, sessionId: payload.sessionId });

      res.json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (error: any) {
      logger.error('Token refresh failed', { error: error.message });
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  }

  /**
   * Logout (invalidate current session)
   */
  async logout(req: Request, res: Response) {
    try {
      const sessionId = (req as any).sessionId;
      const token = req.headers.authorization?.substring(7);

      if (!sessionId || !token) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          code: 'INVALID_REQUEST'
        });
      }

      // Get token expiry for blacklist TTL
      const decoded = this.jwtService.decodeToken(token);
      const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;

      // Blacklist token
      await this.sessionManager.blacklistToken(token, expiresIn);

      // Invalidate session
      await this.sessionManager.invalidateSession(sessionId);

      logger.info('User logged out', { sessionId });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      logger.error('Logout failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          code: 'INVALID_REQUEST'
        });
      }

      // Invalidate all user sessions
      await this.sessionManager.invalidateUserSessions(userId);

      logger.info('User logged out from all devices', { userId });

      res.json({
        success: true,
        message: 'Logged out from all devices'
      });
    } catch (error: any) {
      logger.error('Logout all failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }

  /**
   * Get active sessions
   */
  async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          code: 'INVALID_REQUEST'
        });
      }

      const sessions = await this.sessionManager.getUserSessions(userId);

      res.json({
        success: true,
        sessions: sessions.map(s => ({
          deviceInfo: s.deviceInfo,
          createdAt: s.createdAt,
          lastActivityAt: s.lastActivityAt,
          expiresAt: s.expiresAt
        }))
      });
    } catch (error: any) {
      logger.error('Get sessions failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions',
        code: 'GET_SESSIONS_FAILED'
      });
    }
  }

  /**
   * Revoke specific session
   */
  async revokeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user?.userId;

      // Verify session belongs to user
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        });
      }

      await this.sessionManager.invalidateSession(sessionId);

      logger.info('Session revoked', { userId, sessionId });

      res.json({
        success: true,
        message: 'Session revoked'
      });
    } catch (error: any) {
      logger.error('Revoke session failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to revoke session',
        code: 'REVOKE_SESSION_FAILED'
      });
    }
  }

  /**
   * Forgot password - send reset link
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If email exists, password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await hashPassword(resetToken);

      // Store reset token (1 hour expiry)
      await this.sessionManager.storeResetToken(user.id, resetTokenHash, 3600);

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          user.email,
          resetToken,
          user.fullName
        );
        logger.info('Password reset email sent', { userId: user.id, email: user.email });
      } catch (emailError: any) {
        logger.error('Failed to send password reset email', { 
          userId: user.id, 
          error: emailError.message 
        });
        // Continue anyway - don't reveal email sending failure
      }

      res.json({
        success: true,
        message: 'If email exists, password reset link has been sent'
      });
    } catch (error: any) {
      logger.error('Forgot password failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to process request',
        code: 'FORGOT_PASSWORD_FAILED'
      });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, userId } = req.body;

      const tokenHash = await hashPassword(token);
      const isValid = await this.sessionManager.verifyResetToken(userId, tokenHash);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN'
        });
      }

      // Update password
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      user.passwordHash = await hashPassword(newPassword);
      await userRepo.save(user);

      // Invalidate all sessions for security
      await this.sessionManager.invalidateUserSessions(user.id);

      logger.info('Password reset successful', { userId: user.id });

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error: any) {
      logger.error('Reset password failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to reset password',
        code: 'RESET_PASSWORD_FAILED'
      });
    }
  }

  /**
   * Verify 2FA (OTP or Biometric)
   */
  async verify2FA(req: Request, res: Response) {
    try {
      const { sessionToken, otp, biometricData } = req.body;

      // Verify session token
      const decoded = this.jwtService.verifyToken(sessionToken);

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: decoded.userId },
        relations: ['permissions']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verify OTP if provided
      if (otp) {
        const isValidOTP = await this.sessionManager.verifyOTP(user.id, otp);
        if (!isValidOTP) {
          return res.status(401).json({
            success: false,
            error: 'Invalid OTP',
            code: 'INVALID_OTP'
          });
        }
      }

      // Verify biometric if provided
      if (biometricData) {
        // TODO: Implement biometric verification
        // const isValidBiometric = await biometricService.verify(user.id, biometricData);
        // if (!isValidBiometric) {
        //   return res.status(401).json({ error: 'Biometric verification failed' });
        // }
      }

      // Generate tokens
      const sessionId = crypto.randomUUID();
      const accessToken = this.jwtService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        permissions: user.permissions || []
      });

      const refreshToken = this.jwtService.generateRefreshToken(user.id, sessionId);

      // Create session
      await this.sessionManager.createSession(
        sessionId,
        user.id,
        user.email,
        user.role,
        {
          userAgent: req.get('user-agent') || 'unknown',
          ip: req.ip || 'unknown',
          deviceType: 'unknown'
        }
      );

      // Update last login
      user.lastLoginAt = new Date();
      await userRepo.save(user);

      logger.info('2FA verified successfully', { userId: user.id });

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error: any) {
      logger.error('2FA verification failed', { error: error.message });
      res.status(401).json({
        success: false,
        error: '2FA verification failed',
        code: '2FA_VERIFICATION_FAILED'
      });
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req: Request, res: Response) {
    try {
      const { sessionToken } = req.body;

      const decoded = this.jwtService.verifyToken(sessionToken);

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: decoded.userId } });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Generate and send new OTP
      const otp = generateOTP();
      await this.sessionManager.storeOTP(user.id, otp, 600);
      
      // Send OTP via SMS and email
      try {
        await sendSMS(user.phone, `Your Eazepay verification code is: ${otp}`);
      } catch (smsError: any) {
        logger.warn('SMS sending failed, trying email', { error: smsError.message });
      }
      
      try {
        await emailService.sendOTPEmail(user.email, otp, user.fullName);
      } catch (emailError: any) {
        logger.error('Failed to send OTP email', { error: emailError.message });
      }

      logger.info('OTP resent', { userId: user.id });

      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error: any) {
      logger.error('Resend OTP failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to resend OTP',
        code: 'RESEND_OTP_FAILED'
      });
    }
  }
}
