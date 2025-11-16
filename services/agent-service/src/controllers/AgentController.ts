import { Request, Response } from 'express';
import { ServiceClient } from '../../shared/service-client/src/ServiceClient';
import { AuditLogger } from '../../shared/security/src/audit/AuditLogger';
import Redis from 'ioredis';

export class AgentController {
  private biometricService: ServiceClient;
  private identityService: ServiceClient;
  private walletService: ServiceClient;
  private auditLogger: AuditLogger;
  private redis: Redis;

  constructor() {
    // Initialize service clients for inter-service communication
    this.biometricService = new ServiceClient({
      serviceName: 'biometric-service',
      baseURL: process.env.BIOMETRIC_SERVICE_URL || 'http://biometric-service:8001',
      timeout: 30000,
      headers: {
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY!
      }
    });

    this.identityService = new ServiceClient({
      serviceName: 'identity-service',
      baseURL: process.env.IDENTITY_SERVICE_URL || 'http://identity-service:8000',
      timeout: 10000,
      headers: {
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY!
      }
    });

    this.walletService = new ServiceClient({
      serviceName: 'wallet-service',
      baseURL: process.env.WALLET_SERVICE_URL || 'http://wallet-service:8003',
      timeout: 10000,
      headers: {
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY!
      }
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.auditLogger = new AuditLogger({
      serviceName: 'agent-service',
      redis: this.redis,
      logToFile: true,
      logToRedis: true
    });
  }

  /**
   * Register a new customer at agent location
   * Complete flow: Identity → Biometrics → Wallet
   */
  async registerCustomer(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;
      const {
        phoneNumber,
        fullName,
        nationalId,
        email,
        biometricData, // Array of all 10 fingers + palms
        primaryFingerIndex
      } = req.body;

      // Step 1: Validate agent is active
      const agentStatus = await this.getAgentStatus(agentId);
      if (!agentStatus.active) {
        res.status(403).json({
          success: false,
          error: 'Agent account is not active',
          code: 'AGENT_INACTIVE'
        });
        return;
      }

      // Step 2: Check if phone number already registered
      try {
        const existingUser = await this.identityService.get(`/api/users/phone/${phoneNumber}`);
        if (existingUser) {
          res.status(409).json({
            success: false,
            error: 'Phone number already registered',
            code: 'PHONE_EXISTS'
          });
          return;
        }
      } catch (error: any) {
        // User doesn't exist, continue
        if (error.response?.status !== 404) {
          throw error;
        }
      }

      // Step 3: Register user via Biometric Service (which calls Identity Service)
      const registrationResponse = await this.biometricService.post(
        '/api/biometric/agent/register',
        {
          phoneNumber,
          fullName,
          nationalId,
          email,
          biometricData,
          primaryFingerIndex
        },
        {
          headers: {
            'Authorization': req.headers.authorization // Pass agent's token
          }
        }
      );

      const userId = registrationResponse.userId;

      // Step 4: Create wallet for user
      const walletResponse = await this.walletService.post('/api/wallet/create', {
        userId,
        currency: 'KES',
        initialBalance: 0
      });

      // Step 5: Log successful registration
      await this.auditLogger.logDataAccess({
        userId: agentId,
        action: 'create',
        resource: 'customer_registration',
        resourceId: userId,
        status: 'success',
        metadata: {
          phoneNumber,
          templatesEnrolled: registrationResponse.templatesEnrolled,
          walletId: walletResponse.walletId
        }
      });

      // Step 6: Update agent statistics
      await this.incrementAgentStats(agentId, 'registrations');

      res.status(201).json({
        success: true,
        userId,
        walletId: walletResponse.walletId,
        templatesEnrolled: registrationResponse.templatesEnrolled,
        message: 'Customer registered successfully',
        nextSteps: [
          'Customer can now use biometric payment',
          'Customer should top up wallet via M-Pesa',
          'Customer can request virtual card for online shopping'
        ]
      });
    } catch (error: any) {
      console.error('Customer registration error:', error);
      
      await this.auditLogger.logSecurity({
        userId: (req as any).user.userId,
        action: 'customer_registration_failed',
        resource: 'agent_registration',
        status: 'failure',
        severity: 'medium',
        metadata: {
          error: error.message,
          phoneNumber: req.body.phoneNumber
        }
      });

      res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR',
        message: error.message
      });
    }
  }

  /**
   * Verify customer biometric at agent location
   */
  async verifyCustomer(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;
      const { biometricData } = req.body;

      // Call biometric service to verify
      const verificationResponse = await this.biometricService.post(
        '/api/biometric/verify',
        {
          transactionId: crypto.randomUUID(),
          amount: 0, // Just verification, no payment
          currency: 'KES',
          merchantId: agentId,
          biometricData
        },
        {
          headers: {
            'Authorization': req.headers.authorization
          }
        }
      );

      if (verificationResponse.authorized) {
        // Get customer details
        const customerDetails = await this.identityService.get(
          `/api/users/${verificationResponse.userId}`
        );

        res.json({
          success: true,
          verified: true,
          customer: {
            userId: verificationResponse.userId,
            fullName: customerDetails.fullName,
            phoneNumber: customerDetails.phoneNumber,
            matchScore: verificationResponse.matchScore
          }
        });
      } else {
        res.json({
          success: true,
          verified: false,
          message: 'Biometric verification failed'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Verification failed',
        code: 'VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Process cash-in transaction (customer deposits cash at agent)
   */
  async processCashIn(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;
      const { biometricData, amount, currency } = req.body;

      // Step 1: Verify customer biometric
      const verification = await this.biometricService.post(
        '/api/biometric/verify',
        {
          transactionId: crypto.randomUUID(),
          amount: 0,
          currency,
          merchantId: agentId,
          biometricData
        },
        {
          headers: {
            'Authorization': req.headers.authorization
          }
        }
      );

      if (!verification.authorized) {
        res.status(401).json({
          success: false,
          error: 'Biometric verification failed',
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      const customerId = verification.userId;

      // Step 2: Credit customer wallet
      const walletResponse = await this.walletService.post('/api/wallet/credit', {
        userId: customerId,
        amount,
        currency,
        source: 'agent_cash_in',
        agentId,
        reference: crypto.randomUUID()
      });

      // Step 3: Debit agent float
      await this.walletService.post('/api/wallet/debit', {
        userId: agentId,
        amount,
        currency,
        reason: 'cash_in_to_customer',
        reference: walletResponse.transactionId
      });

      // Step 4: Log transaction
      await this.auditLogger.logTransaction({
        userId: agentId,
        action: 'cash_in',
        resourceId: walletResponse.transactionId,
        status: 'success',
        metadata: {
          customerId,
          amount,
          currency
        }
      });

      res.json({
        success: true,
        transactionId: walletResponse.transactionId,
        newBalance: walletResponse.newBalance,
        message: `Successfully deposited ${currency} ${amount}`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Cash-in failed',
        code: 'CASH_IN_ERROR'
      });
    }
  }

  /**
   * Process cash-out transaction (customer withdraws cash from agent)
   */
  async processCashOut(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;
      const { biometricData, amount, currency } = req.body;

      // Verify customer and process withdrawal
      const verification = await this.biometricService.post(
        '/api/biometric/verify',
        {
          transactionId: crypto.randomUUID(),
          amount,
          currency,
          merchantId: agentId,
          biometricData
        },
        {
          headers: {
            'Authorization': req.headers.authorization
          }
        }
      );

      if (!verification.authorized) {
        res.status(401).json({
          success: false,
          error: 'Biometric verification failed',
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      const customerId = verification.userId;

      // Debit customer wallet
      const walletResponse = await this.walletService.post('/api/wallet/debit', {
        userId: customerId,
        amount,
        currency,
        reason: 'agent_cash_out',
        agentId,
        reference: crypto.randomUUID()
      });

      // Credit agent float
      await this.walletService.post('/api/wallet/credit', {
        userId: agentId,
        amount,
        currency,
        source: 'cash_out_from_customer',
        reference: walletResponse.transactionId
      });

      res.json({
        success: true,
        transactionId: walletResponse.transactionId,
        newBalance: walletResponse.newBalance,
        message: `Successfully withdrew ${currency} ${amount}`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Cash-out failed',
        code: 'CASH_OUT_ERROR'
      });
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;

      const stats = await this.redis.hgetall(`agent:stats:${agentId}`);

      res.json({
        success: true,
        stats: {
          registrations: parseInt(stats.registrations || '0'),
          cashIns: parseInt(stats.cashIns || '0'),
          cashOuts: parseInt(stats.cashOuts || '0'),
          totalVolume: parseFloat(stats.totalVolume || '0')
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve stats',
        code: 'STATS_ERROR'
      });
    }
  }

  // Helper methods
  private async getAgentStatus(agentId: string): Promise<{ active: boolean }> {
    // Check agent status in database
    return { active: true };
  }

  private async incrementAgentStats(agentId: string, metric: string): Promise<void> {
    await this.redis.hincrby(`agent:stats:${agentId}`, metric, 1);
  }
}
