import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';   // ✅ import your DataSource
import { User, KYCStatus } from '../entities/User';
import { BiometricService } from '../services/BiometricService';
import { JWTService } from '../services/JWTService';
import { logger } from '../utils/logger';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);  // ✅ fixed
  private biometricService = new BiometricService();
  private jwtService = new JWTService();

  async register(req: Request, res: Response) {
    try {
      const { phoneNumber, nationalId, firstName, lastName, biometricData, biometricType } = req.body;

      // ⚠️ In TypeORM v0.3+, `findOne` must specify options
      const existingUser = await this.userRepository.findOne({ where: { phoneNumber } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this phone number already exists'
        });
      }

      // Create user
      const user = new User();
      user.phoneNumber = phoneNumber;
      user.nationalId = nationalId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.kycStatus = KYCStatus.PENDING;

      const savedUser = await this.userRepository.save(user);

      // Process biometric data if provided
      let biometricResult = null;
      if (biometricData && biometricType) {
        biometricResult = await this.biometricService.enrollBiometric(
          savedUser.userId,
          biometricData,
          biometricType
        );
        
        if (biometricResult.success) {
          savedUser.authLevel = 2; // Biometric enrolled
          await this.userRepository.save(savedUser);
        }
      }

      // Generate JWT token
      const token = this.jwtService.generateToken({
        userId: savedUser.userId,
        phoneNumber: savedUser.phoneNumber,
        authLevel: savedUser.authLevel
      });

      res.status(201).json({
        success: true,
        data: {
          userId: savedUser.userId,
          phoneNumber: savedUser.phoneNumber,
          authLevel: savedUser.authLevel,
          kycStatus: savedUser.kycStatus,
          biometricEnrolled: biometricResult?.success || false,
          token
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  async authenticateWithBiometric(req: Request, res: Response) {
    try {
      const { phoneNumber, biometricData, biometricType } = req.body;

      const user = await this.userRepository.findOne({ where: { phoneNumber } });
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed'
        });
      }

      const verificationResult = await this.biometricService.verifyBiometric(
        user.userId,
        biometricData,
        biometricType
      );

      if (!verificationResult.verified) {
        return res.status(401).json({
          success: false,
          error: 'Biometric authentication failed'
        });
      }

      user.authLevel = Math.max(user.authLevel, 2);
      await this.userRepository.save(user);

      const token = this.jwtService.generateToken({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        authLevel: user.authLevel
      });

      res.json({
        success: true,
        data: {
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          authLevel: user.authLevel,
          confidence: verificationResult.confidence,
          token
        }
      });

    } catch (error) {
      logger.error('Biometric authentication error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  async getAuthLevel(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.params;

      const user = await this.userRepository.findOne({ where: { phoneNumber } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          authLevel: user.authLevel,
          kycStatus: user.kycStatus,
          accountTier: user.accountTier
        }
      });

    } catch (error) {
      logger.error('Get auth level error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve authentication level'
      });
    }
  }
}
