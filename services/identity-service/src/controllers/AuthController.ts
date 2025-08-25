import { Request, Response } from 'express';
import axios from 'axios';
import { AppDataSource } from '../config/database';
import { User, KYCStatus, AccountTier } from '../entities/User';
import { JWTService } from '../services/JWTService';
import { logger } from '../utils/logger';

const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL || 'http://biometric-service:8001';

interface BiometricResponse {
  success: boolean;
  matchScore?: number;
  message?: string;
  userId?: string;
  error?: string;
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { phoneNumber, nationalId, firstName, lastName, imageData } = req.body;

      // Check if user already exists
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { phoneNumber } });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'User with this phone number already exists' 
        });
      }

      // Create new user
      const user = new User();
      user.phoneNumber = phoneNumber;
      user.nationalId = nationalId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.kycStatus = KYCStatus.PENDING;
      user.accountTier = AccountTier.BASIC;
      user.authLevel = 0; // Start with no auth level
      user.isActive = true;

      // Save user to database
      await userRepository.save(user);

      // Register biometric data if provided
      if (imageData) {
        try {
          const biometricResult = await axios.post(`${BIOMETRIC_SERVICE_URL}/register`, {
            userId: user.userId,
            imageData: imageData
          });

          const resultData = biometricResult.data as BiometricResponse;

          if (resultData.success) {
            // Update auth level if biometric registration succeeds
            user.authLevel = 2; // Biometric authentication level
            await userRepository.save(user);
          } else {
            logger.warn('Biometric registration failed:', resultData.message);
          }
        } catch (error) {
          logger.error('Biometric service error:', error);
          // Continue without biometric if service is unavailable
        }
      }

      // Generate JWT token
      const token = JWTService.generateToken({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        authLevel: user.authLevel
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus,
          accountTier: user.accountTier,
          authLevel: user.authLevel
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { phoneNumber, imageData } = req.body;

      // Find user by phone number
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { phoneNumber } });
      
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials or account inactive' 
        });
      }

      // Verify biometric data
      if (imageData) {
        try {
          const biometricResult = await axios.post(`${BIOMETRIC_SERVICE_URL}/verify`, {
            userId: user.userId,
            imageData: imageData
          });

          const resultData = biometricResult.data as BiometricResponse;

          if (!resultData.success) {
            return res.status(401).json({ 
              success: false, 
              error: resultData.message || 'Biometric verification failed' 
            });
          }
        } catch (error) {
          logger.error('Biometric service error:', error);
          return res.status(500).json({ 
            success: false, 
            error: 'Biometric service unavailable' 
          });
        }
      } else {
        return res.status(400).json({ 
          success: false, 
          error: 'Biometric data required for login' 
        });
      }

      // Generate JWT token
      const token = JWTService.generateToken({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        authLevel: user.authLevel
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          kycStatus: user.kycStatus,
          accountTier: user.accountTier,
          authLevel: user.authLevel
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  static async verifyBiometric(req: Request, res: Response) {
    try {
      const { userId, imageData } = req.body;

      if (!userId || !imageData) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and image data are required' 
        });
      }

      // Verify biometric data
      const verificationResult = await axios.post(`${BIOMETRIC_SERVICE_URL}/verify`, {
        userId: userId,
        imageData: imageData
      });

      const resultData = verificationResult.data as BiometricResponse;

      if (resultData.success) {
        // Find user by ID
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { userId } });
        
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            error: 'User not found' 
          });
        }

        // Generate JWT token
        const token = JWTService.generateToken({
          userId: user.userId,
          phoneNumber: user.phoneNumber,
          authLevel: user.authLevel
        });

        res.json({
          success: true,
          message: 'Biometric verification successful',
          token,
          user: {
            userId: user.userId,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            kycStatus: user.kycStatus,
            accountTier: user.accountTier,
            authLevel: user.authLevel
          }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          error: resultData.message || 'Biometric verification failed' 
        });
      }
    } catch (error) {
      logger.error('Biometric verification error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  static async getAuthLevel(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.params;

      // Find user by phone number
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { phoneNumber } });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      res.json({
        success: true,
        authLevel: user.authLevel,
        phoneNumber: user.phoneNumber,
        userId: user.userId
      });
    } catch (error) {
      logger.error('Get auth level error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
}

export default AuthController;