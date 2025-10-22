import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus, TwoFactorMethod } from '../models/User';
import { Session } from '../models/Session';
import { UserPermission } from '../models/UserPermission';
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyAccessToken,
  generateOTP,
  verifyTOTP,
  sendSMS,
  generateCorrelationId
} from '../utils/security';
import { AuditLog, AuditActionType } from '../models/AuditLog';
import axios from 'axios';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';

export class AuthController {
  // Customer/Agent Registration
  async register(req: Request, res: Response) {
    try {
      const {
        email,
        phone,
        password,
        fullName,
        role,
        verificationType,
        verificationNumber,
        businessDetails
      } = req.body;

      const userRepo = AppDataSource.getRepository(User);

      // Validate role
      if (![UserRole.CUSTOMER, UserRole.AGENT].includes(role)) {
        return res.status(400).json({ error: 'Invalid role for registration' });
      }

      // Check if user exists
      const existingUser = await userRepo.findOne({
        where: [{ email }, { phone }]
      });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = userRepo.create({
        email,
        phone,
        passwordHash,
        fullName,
        role,
        status: UserStatus.PENDING,
        verificationType,
        verificationNumber,
        businessDetails: role === UserRole.AGENT ? businessDetails : null
      });

      await userRepo.save(user);

      // For customers, attempt automatic government verification
      if (role === UserRole.CUSTOMER) {
        try {
          const verified = await this.verifyGovernmentID(verificationType, verificationNumber);
          if (verified) {
            user.governmentVerified = true;
            user.status = UserStatus.VERIFIED;
            await userRepo.save(user);
          }
        } catch (error) {
          console.error('Government verification failed:', error);
          // Continue with manual verification
        }
      }

      // Notify admins for verification
      await this.notifyAdminsForVerification(user);

      res.status(201).json({
        message: 'Registration successful. Awaiting verification.',
        userId: user.id,
        status: user.status,
        requiresDocuments: role === UserRole.AGENT
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login with 2FA
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const user = await userRepo.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(403).json({
          error: 'Account is locked. Please try again later.',
          lockedUntil: user.lockedUntil
        });
      }

      // Verify password
      const validPassword = await verifyPassword(password, user.passwordHash);
      if (!validPassword) {
        user.failedLoginAttempts += 1;

        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }

        await userRepo.save(user);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is verified
      if (user.status !== UserStatus.VERIFIED) {
        return res.status(403).json({
          error: 'Account pending verification',
          status: user.status
        });
      }

      // Reset failed attempts
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;

      // For superusers and users with 2FA enabled, require 2FA
      if (user.role === UserRole.SUPERUSER || user.twoFactorEnabled) {
        const correlationId = generateCorrelationId();
        const sessionToken = generateTokenPair(user, correlationId, []).accessToken;

        // Send OTP if SMS is enabled
        if (user.twoFactorMethod === TwoFactorMethod.SMS || user.twoFactorMethod === TwoFactorMethod.BOTH) {
          const otp = generateOTP();
          await sendSMS(user.phone, `Your AfriPay verification code is: ${otp}`);
          // Store OTP in Redis with 10-minute expiry
          // await redis.setex(`otp:${user.id}`, 600, otp);
        }

        return res.json({
          requires2FA: true,
          sessionToken,
          twoFactorMethod: user.twoFactorMethod,
          requiresBiometric: user.twoFactorMethod === TwoFactorMethod.BIOMETRIC || user.twoFactorMethod === TwoFactorMethod.BOTH
        });
      }

      // Generate access token
      const token = this.generateAccessToken(user);
      user.lastLoginAt = new Date();
      await userRepo.save(user);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Verify 2FA
  async verify2FA(req: Request, res: Response) {
    try {
      const { sessionToken, otp, biometricData } = req.body;

      // Verify session token
      const decoded: any = jwt.verify(sessionToken, process.env.JWT_SECRET!);
      if (decoded.step !== '2fa_pending') {
        return res.status(400).json({ error: 'Invalid session' });
      }

      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: decoded.userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let verified = false;

      // Verify OTP if SMS method
      if (user.twoFactorMethod === TwoFactorMethod.SMS || user.twoFactorMethod === TwoFactorMethod.BOTH) {
        if (!otp) {
          return res.status(400).json({ error: 'OTP required' });
        }
        // Verify OTP from Redis
        // const storedOTP = await redis.get(`otp:${user.id}`);
        // verified = otp === storedOTP;
        verified = true; // Placeholder
      }

      // Verify biometric if biometric method
      if (user.twoFactorMethod === TwoFactorMethod.BIOMETRIC || user.twoFactorMethod === TwoFactorMethod.BOTH) {
        if (!biometricData) {
          return res.status(400).json({ error: 'Biometric data required' });
        }
        // Call biometric service
        const biometricVerified = await this.verifyBiometric(user.id, biometricData);
        verified = verified && biometricVerified;
      }

      if (!verified) {
        return res.status(401).json({ error: '2FA verification failed' });
      }

      // Generate access token
      const token = this.generateAccessToken(user);
      user.lastLoginAt = new Date();
      await userRepo.save(user);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions
        }
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ error: '2FA verification failed' });
    }
  }

  // Helper: Verify government ID
  private async verifyGovernmentID(type: string, number: string): Promise<boolean> {
    try {
      // Call government API for verification
      const response = await axios.post(process.env.GOVERNMENT_API_URL!, {
        verificationType: type,
        identificationNumber: number
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GOVERNMENT_API_KEY}`
        }
      });

      return (response.data as any).verified === true;
    } catch (error) {
      console.error('Government verification error:', error);
      return false;
    }
  }

  // Helper: Verify biometric
  private async verifyBiometric(userId: string, biometricData: any): Promise<boolean> {
    try {
      const response = await axios.post(`${process.env.BIOMETRIC_SERVICE_URL}/verify`, {
        userId,
        biometricData
      });
      return (response.data as any).verified === true;
    } catch (error) {
      console.error('Biometric verification error:', error);
      return false;
    }
  }

  // Helper: Generate access token
  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
  }

  // Helper: Notify admins
  private async notifyAdminsForVerification(user: User): Promise<void> {
    // Send notification to admins via WebSocket/Email
    // Implementation depends on notification service
    console.log(`Notifying admins for user verification: ${user.id}`);
  }
}
