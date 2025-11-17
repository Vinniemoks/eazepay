import { Request, Response } from 'express';
import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';
import { AgentModel } from '../models/Agent';
import { v4 as uuidv4 } from 'uuid';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8000';
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8003';
const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL || 'http://localhost:8001';

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 12 // Max 12 files (10 fingers + 2 palms)
  }
});

export const uploadMiddleware = upload.array('biometricData', 12);

export class AgentController {
  /**
   * Register customer with all biometric data
   */
  static async registerCustomer(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.userId;
      const { phoneNumber, fullName, email, nationalId, password, primaryFingerIndex } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No biometric data provided'
        });
      }

      // Step 1: Register user
      console.log('Step 1: Registering user...');
      const userResponse = await axios.post(`${USER_SERVICE_URL}/api/auth/register`, {
        phoneNumber,
        fullName,
        email,
        nationalId,
        password: password || `temp${Date.now()}` // Generate temp password if not provided
      });

      const { user, tokens } = userResponse.data.data;
      const userId = user.id;
      const accessToken = tokens.accessToken;

      console.log(`✓ User registered: ${userId}`);

      // Step 2: Create wallet
      console.log('Step 2: Creating wallet...');
      await axios.post(
        `${WALLET_SERVICE_URL}/api/wallet/create`,
        { currency: 'KES' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      console.log('✓ Wallet created');

      // Step 3: Enroll biometrics
      console.log('Step 3: Enrolling biometrics...');
      const enrolledTemplates = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const metadata = JSON.parse(req.body[`metadata_${i}`] || '{}');
        
        const formData = new FormData();
        formData.append('biometricData', file.buffer, file.originalname);
        formData.append('biometricType', metadata.biometricType || 'fingerprint');
        formData.append('fingerType', metadata.fingerType);
        formData.append('hand', metadata.hand);
        formData.append('isPrimary', i === parseInt(primaryFingerIndex || '0') ? 'true' : 'false');

        try {
          const biometricResponse = await axios.post(
            `${BIOMETRIC_SERVICE_URL}/api/biometric/enroll`,
            formData,
            {
              headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          enrolledTemplates.push(biometricResponse.data.data);
          console.log(`✓ Enrolled ${metadata.hand} ${metadata.fingerType}`);
        } catch (error: any) {
          console.error(`✗ Failed to enroll ${metadata.hand} ${metadata.fingerType}:`, error.message);
        }
      }

      // Step 4: Initialize agent float if needed
      console.log('Step 4: Initializing agent float...');
      await AgentModel.initializeFloat(agentId);

      // Step 5: Log agent activity
      console.log('Step 5: Logging agent activity...');
      await AgentModel.logActivity(
        agentId,
        'registration',
        userId,
        undefined,
        undefined,
        `REG-${userId}`,
        { phoneNumber, fullName, biometricsCount: enrolledTemplates.length }
      );

      res.status(201).json({
        success: true,
        data: {
          userId,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName,
          enrolledBiometrics: enrolledTemplates.length,
          templates: enrolledTemplates,
          message: 'Customer registered successfully'
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      res.status(400).json({
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
  }

  /**
   * Verify customer using biometric
   */
  static async verifyCustomer(req: Request, res: Response) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No biometric data provided'
        });
      }

      // Verify biometric (1:N matching)
      const formData = new FormData();
      formData.append('biometricData', file.buffer, file.originalname);

      const biometricResponse = await axios.post(
        `${BIOMETRIC_SERVICE_URL}/api/biometric/verify`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (!biometricResponse.data.success) {
        return res.status(401).json({
          success: false,
          error: 'Customer not found or biometric does not match'
        });
      }

      const { userId, matchScore } = biometricResponse.data.data;

      // Get user details
      const userResponse = await axios.get(
        `${USER_SERVICE_URL}/api/users/${userId}`
      );

      // Get wallet balance
      const walletResponse = await axios.get(
        `${WALLET_SERVICE_URL}/api/wallet/balance`,
        {
          headers: { Authorization: `Bearer ${(req as any).user.token}` }
        }
      );

      res.json({
        success: true,
        data: {
          user: userResponse.data.data.user,
          wallet: walletResponse.data.data,
          matchScore,
          verified: true
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
  }

  /**
   * Cash-in transaction
   */
  static async cashIn(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.userId;
      const { amount, phoneNumber } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Biometric verification required'
        });
      }

      // Verify customer biometric
      const formData = new FormData();
      formData.append('biometricData', file.buffer, file.originalname);

      const biometricResponse = await axios.post(
        `${BIOMETRIC_SERVICE_URL}/api/biometric/verify`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (!biometricResponse.data.success) {
        return res.status(401).json({
          success: false,
          error: 'Biometric verification failed'
        });
      }

      const { userId } = biometricResponse.data.data;

      const transactionId = `CASHIN-${uuidv4()}`;

      // Debit agent float
      await AgentModel.debitFloat(
        agentId,
        amount,
        'cash_in',
        transactionId,
        `Cash-in for customer ${userId}`
      );

      // Credit customer wallet (call wallet service)
      // TODO: Implement wallet service call

      // Log activity
      await AgentModel.logActivity(
        agentId,
        'cash_in',
        userId,
        amount,
        amount * 0.02, // 2% commission
        transactionId
      );

      res.json({
        success: true,
        data: {
          transactionId,
          userId,
          amount,
          type: 'cash-in',
          message: 'Cash-in successful'
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
  }

  /**
   * Cash-out transaction
   */
  static async cashOut(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.userId;
      const { amount } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Biometric verification required'
        });
      }

      // Verify customer biometric
      const formData = new FormData();
      formData.append('biometricData', file.buffer, file.originalname);

      const biometricResponse = await axios.post(
        `${BIOMETRIC_SERVICE_URL}/api/biometric/verify`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (!biometricResponse.data.success) {
        return res.status(401).json({
          success: false,
          error: 'Biometric verification failed'
        });
      }

      const { userId } = biometricResponse.data.data;

      const transactionId = `CASHOUT-${uuidv4()}`;

      // Debit customer wallet (call wallet service)
      // TODO: Implement wallet service call

      // Credit agent float
      await AgentModel.creditFloat(
        agentId,
        amount,
        'cash_out',
        transactionId,
        `Cash-out for customer ${userId}`
      );

      // Log activity
      await AgentModel.logActivity(
        agentId,
        'cash_out',
        userId,
        amount,
        amount * 0.02, // 2% commission
        transactionId
      );

      res.json({
        success: true,
        data: {
          transactionId,
          userId,
          amount,
          type: 'cash-out',
          message: 'Cash-out successful'
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
  }

  /**
   * Get agent statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.userId;

      const stats = await AgentModel.getStatistics(agentId);
      const float = await AgentModel.getFloat(agentId);

      res.json({
        success: true,
        data: {
          ...stats,
          floatBalance: float?.balance || 0,
          floatCurrency: float?.currency || 'KES'
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get agent transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const agentId = (req as any).user.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const activities = await AgentModel.getActivities(agentId, limit, offset);

      res.json({
        success: true,
        data: {
          activities,
          limit,
          offset
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
