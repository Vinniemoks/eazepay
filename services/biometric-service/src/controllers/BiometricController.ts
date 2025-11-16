import { Request, Response } from 'express';
import { BiometricPaymentService } from '../../biometric-payment-service/src/BiometricPaymentService';
import { ServiceClient } from '../../shared/service-client/src/ServiceClient';
import { AuditLogger } from '../../shared/security/src/audit/AuditLogger';
import { DataEncryption } from '../../shared/security/src/encryption/DataEncryption';
import Redis from 'ioredis';
import crypto from 'crypto';

interface BiometricTemplate {
  id: string;
  userId: string;
  fingerType?: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  hand?: 'left' | 'right';
  templateType: 'fingerprint' | 'palm';
  templateData: string; // Encrypted
  templateHash: string; // For duplicate detection
  isPrimary: boolean;
  enrolledBy: 'user' | 'agent';
  agentId?: string;
  deviceInfo?: any;
  enrolledAt: Date;
  lastUsedAt?: Date;
}

export class BiometricController {
  private biometricService: BiometricPaymentService;
  private identityService: ServiceClient;
  private auditLogger: AuditLogger;
  private encryption: DataEncryption;
  private redis: Redis;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    this.biometricService = new BiometricPaymentService(encryptionKey);
    this.encryption = new DataEncryption(encryptionKey);
    
    // Initialize service clients for inter-service communication
    this.identityService = new ServiceClient({
      serviceName: 'identity-service',
      baseURL: process.env.IDENTITY_SERVICE_URL || 'http://identity-service:8000',
      timeout: 10000,
      headers: {
        'X-Internal-API-Key': process.env.INTERNAL_API_KEY!
      }
    });

    // Initialize Redis for caching and duplicate detection
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    // Initialize audit logger
    this.auditLogger = new AuditLogger({
      serviceName: 'biometric-service',
      redis: this.redis,
      logToFile: true,
      logToRedis: true
    });
  }

  /**
   * Agent registers a new user with biometrics
   * This is the primary registration flow at agent locations
   */
  async agentRegisterUser(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user.userId;
      const agentRole = (req as any).user.role;

      // Verify agent permissions
      if (agentRole !== 'AGENT' && agentRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Only agents can register users',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
        return;
      }

      const {
        phoneNumber,
        fullName,
        nationalId,
        biometricData, // Array of fingerprints/palms
        primaryFingerIndex
      } = req.body;

      // Step 1: Check for duplicate biometrics (fraud prevention)
      const duplicateCheck = await this.checkForDuplicates(biometricData);
      if (duplicateCheck.hasDuplicate) {
        await this.auditLogger.logSecurity({
          userId: agentId,
          action: 'duplicate_biometric_detected',
          resource: 'biometric_registration',
          status: 'failure',
          severity: 'high',
          metadata: {
            phoneNumber,
            existingUserId: duplicateCheck.existingUserId
          }
        });

        res.status(409).json({
          success: false,
          error: 'Biometric already registered to another user',
          code: 'DUPLICATE_BIOMETRIC',
          existingUserId: duplicateCheck.existingUserId
        });
        return;
      }

      // Step 2: Create user account via Identity Service
      const userResponse = await this.identityService.post('/api/users/create', {
        phoneNumber,
        fullName,
        nationalId,
        registeredBy: 'agent',
        agentId
      });

      const userId = userResponse.userId;

      // Step 3: Enroll all biometric templates
      const enrolledTemplates: BiometricTemplate[] = [];
      
      for (let i = 0; i < biometricData.length; i++) {
        const data = biometricData[i];
        const isPrimary = i === primaryFingerIndex;

        let template: BiometricTemplate;

        if (data.type === 'fingerprint') {
          const enrolled = await this.biometricService.enrollFingerprint(
            userId,
            data.fingerType,
            data.hand,
            Buffer.from(data.data, 'base64'),
            isPrimary
          );

          template = {
            id: crypto.randomUUID(),
            userId,
            fingerType: data.fingerType,
            hand: data.hand,
            templateType: 'fingerprint',
            templateData: enrolled.templateData,
            templateHash: this.generateTemplateHash(enrolled.templateData),
            isPrimary,
            enrolledBy: 'agent',
            agentId,
            enrolledAt: new Date()
          };
        } else {
          const enrolled = await this.biometricService.enrollPalm(
            userId,
            data.hand,
            Buffer.from(data.data, 'base64')
          );

          template = {
            id: crypto.randomUUID(),
            userId,
            hand: data.hand,
            templateType: 'palm',
            templateData: enrolled.templateData,
            templateHash: this.generateTemplateHash(enrolled.templateData),
            isPrimary: false,
            enrolledBy: 'agent',
            agentId,
            enrolledAt: new Date()
          };
        }

        // Store template in database
        await this.storeBiometricTemplate(template);
        
        // Store hash for duplicate detection
        await this.redis.set(
          `biometric:hash:${template.templateHash}`,
          userId,
          'EX',
          31536000 // 1 year
        );

        enrolledTemplates.push(template);
      }

      // Step 4: Log successful registration
      await this.auditLogger.logDataAccess({
        userId: agentId,
        action: 'create',
        resource: 'biometric_registration',
        resourceId: userId,
        status: 'success',
        metadata: {
          templatesEnrolled: enrolledTemplates.length,
          phoneNumber,
          agentId
        }
      });

      res.status(201).json({
        success: true,
        userId,
        templatesEnrolled: enrolledTemplates.length,
        primaryTemplate: enrolledTemplates.find(t => t.isPrimary)?.id,
        message: 'User registered successfully with biometrics'
      });
    } catch (error: any) {
      console.error('Agent registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        code: 'REGISTRATION_ERROR',
        message: error.message
      });
    }
  }

  /**
   * Enroll fingerprint (user self-enrollment or agent)
   */
  async enrollFingerprint(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { fingerType, hand, biometricData, isPrimary } = req.body;

      // Check if already enrolled
      const existing = await this.getExistingTemplate(userId, 'fingerprint', fingerType, hand);
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'Fingerprint already enrolled',
          code: 'ALREADY_ENROLLED'
        });
        return;
      }

      // Enroll fingerprint
      const enrolled = await this.biometricService.enrollFingerprint(
        userId,
        fingerType,
        hand,
        Buffer.from(biometricData, 'base64'),
        isPrimary || false
      );

      const template: BiometricTemplate = {
        id: crypto.randomUUID(),
        userId,
        fingerType,
        hand,
        templateType: 'fingerprint',
        templateData: enrolled.templateData,
        templateHash: this.generateTemplateHash(enrolled.templateData),
        isPrimary: isPrimary || false,
        enrolledBy: 'user',
        deviceInfo: {
          userAgent: req.get('user-agent'),
          ip: req.ip
        },
        enrolledAt: new Date()
      };

      await this.storeBiometricTemplate(template);
      await this.redis.set(
        `biometric:hash:${template.templateHash}`,
        userId,
        'EX',
        31536000
      );

      await this.auditLogger.logDataAccess({
        userId,
        action: 'create',
        resource: 'fingerprint',
        resourceId: template.id,
        status: 'success'
      });

      res.status(201).json({
        success: true,
        templateId: template.id,
        message: 'Fingerprint enrolled successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Enrollment failed',
        code: 'ENROLLMENT_ERROR'
      });
    }
  }

  /**
   * Enroll palm print
   */
  async enrollPalm(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { hand, biometricData } = req.body;

      const enrolled = await this.biometricService.enrollPalm(
        userId,
        hand,
        Buffer.from(biometricData, 'base64')
      );

      const template: BiometricTemplate = {
        id: crypto.randomUUID(),
        userId,
        hand,
        templateType: 'palm',
        templateData: enrolled.templateData,
        templateHash: this.generateTemplateHash(enrolled.templateData),
        isPrimary: false,
        enrolledBy: 'user',
        enrolledAt: new Date()
      };

      await this.storeBiometricTemplate(template);
      await this.redis.set(
        `biometric:hash:${template.templateHash}`,
        userId,
        'EX',
        31536000
      );

      res.status(201).json({
        success: true,
        templateId: template.id,
        message: 'Palm print enrolled successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Enrollment failed',
        code: 'ENROLLMENT_ERROR'
      });
    }
  }

  /**
   * Verify biometric for payment authorization
   */
  async verifyBiometric(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, amount, currency, merchantId, biometricData } = req.body;

      // Get all enrolled templates from database
      const templates = await this.getAllUserTemplates();

      // Verify biometric
      const authorization = await this.biometricService.authorizePayment(
        transactionId,
        amount,
        currency,
        merchantId,
        Buffer.from(biometricData, 'base64'),
        templates
      );

      if (authorization.biometricMatch) {
        // Update last used timestamp
        await this.updateLastUsed(authorization.userId);

        await this.auditLogger.logSecurity({
          userId: authorization.userId,
          action: 'biometric_verification',
          resource: 'payment',
          status: 'success',
          severity: 'medium',
          metadata: {
            transactionId,
            amount,
            matchScore: authorization.matchScore
          }
        });
      } else {
        await this.auditLogger.logSecurity({
          action: 'biometric_verification',
          resource: 'payment',
          status: 'failure',
          severity: 'high',
          metadata: {
            transactionId,
            matchScore: authorization.matchScore
          }
        });
      }

      res.json({
        success: authorization.biometricMatch,
        userId: authorization.userId,
        matchScore: authorization.matchScore,
        authorized: authorization.biometricMatch
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Verification failed',
        code: 'VERIFICATION_ERROR'
      });
    }
  }

  /**
   * Check for duplicate biometrics (fraud detection)
   */
  async checkDuplicate(req: Request, res: Response): Promise<void> {
    try {
      const { biometricData } = req.body;

      const result = await this.checkForDuplicates([{
        type: 'fingerprint',
        data: biometricData
      }]);

      res.json({
        success: true,
        hasDuplicate: result.hasDuplicate,
        existingUserId: result.existingUserId
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Duplicate check failed',
        code: 'DUPLICATE_CHECK_ERROR'
      });
    }
  }

  /**
   * Get user's enrolled biometrics
   */
  async getUserBiometrics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const requestingUserId = (req as any).user.userId;

      // Only allow users to see their own biometrics or admins
      if (userId !== requestingUserId && (req as any).user.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          code: 'FORBIDDEN'
        });
        return;
      }

      const templates = await this.getUserTemplates(userId);

      // Remove sensitive template data
      const sanitized = templates.map(t => ({
        id: t.id,
        templateType: t.templateType,
        fingerType: t.fingerType,
        hand: t.hand,
        isPrimary: t.isPrimary,
        enrolledBy: t.enrolledBy,
        enrolledAt: t.enrolledAt,
        lastUsedAt: t.lastUsedAt
      }));

      res.json({
        success: true,
        templates: sanitized,
        count: sanitized.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve biometrics',
        code: 'RETRIEVAL_ERROR'
      });
    }
  }

  /**
   * Sync biometrics from mobile device
   */
  async syncFromMobile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { biometricData } = req.body;

      // Check if biometric already exists
      const duplicateCheck = await this.checkForDuplicates([{
        type: 'fingerprint',
        data: biometricData
      }]);

      if (duplicateCheck.hasDuplicate && duplicateCheck.existingUserId !== userId) {
        res.status(409).json({
          success: false,
          error: 'Biometric belongs to another user',
          code: 'DUPLICATE_BIOMETRIC'
        });
        return;
      }

      // If it's the same user, just update
      if (duplicateCheck.hasDuplicate && duplicateCheck.existingUserId === userId) {
        res.json({
          success: true,
          message: 'Biometric already synced',
          action: 'none'
        });
        return;
      }

      // Enroll new biometric from mobile
      const enrolled = await this.biometricService.enrollFingerprint(
        userId,
        'index', // Default to index finger
        'right',
        Buffer.from(biometricData, 'base64'),
        false
      );

      const template: BiometricTemplate = {
        id: crypto.randomUUID(),
        userId,
        fingerType: 'index',
        hand: 'right',
        templateType: 'fingerprint',
        templateData: enrolled.templateData,
        templateHash: this.generateTemplateHash(enrolled.templateData),
        isPrimary: false,
        enrolledBy: 'user',
        deviceInfo: {
          source: 'mobile_sync',
          userAgent: req.get('user-agent')
        },
        enrolledAt: new Date()
      };

      await this.storeBiometricTemplate(template);
      await this.redis.set(
        `biometric:hash:${template.templateHash}`,
        userId,
        'EX',
        31536000
      );

      res.json({
        success: true,
        templateId: template.id,
        message: 'Biometric synced from mobile device'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Sync failed',
        code: 'SYNC_ERROR'
      });
    }
  }

  /**
   * Delete biometric template
   */
  async deleteBiometric(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const userId = (req as any).user.userId;

      const template = await this.getTemplate(templateId);
      
      if (!template || template.userId !== userId) {
        res.status(404).json({
          success: false,
          error: 'Template not found',
          code: 'NOT_FOUND'
        });
        return;
      }

      await this.deleteTemplate(templateId);
      await this.redis.del(`biometric:hash:${template.templateHash}`);

      await this.auditLogger.logDataAccess({
        userId,
        action: 'delete',
        resource: 'biometric',
        resourceId: templateId,
        status: 'success'
      });

      res.json({
        success: true,
        message: 'Biometric template deleted'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Deletion failed',
        code: 'DELETION_ERROR'
      });
    }
  }

  // Helper methods
  private async checkForDuplicates(biometricData: any[]): Promise<{
    hasDuplicate: boolean;
    existingUserId?: string;
  }> {
    for (const data of biometricData) {
      const buffer = Buffer.from(data.data, 'base64');
      const features = this.extractFeatures(buffer);
      const hash = this.generateTemplateHash(JSON.stringify(features));
      
      const existingUserId = await this.redis.get(`biometric:hash:${hash}`);
      if (existingUserId) {
        return { hasDuplicate: true, existingUserId };
      }
    }
    return { hasDuplicate: false };
  }

  private extractFeatures(buffer: Buffer): any {
    // Simplified - use proper biometric SDK in production
    return crypto.createHash('sha256').update(buffer).digest();
  }

  private generateTemplateHash(templateData: string): string {
    return crypto.createHash('sha256').update(templateData).digest('hex');
  }

  // Database operations (implement with your actual database)
  private async storeBiometricTemplate(template: BiometricTemplate): Promise<void> {
    // Store in PostgreSQL
    await this.redis.set(
      `biometric:template:${template.id}`,
      JSON.stringify(template),
      'EX',
      31536000
    );
  }

  private async getTemplate(templateId: string): Promise<BiometricTemplate | null> {
    const data = await this.redis.get(`biometric:template:${templateId}`);
    return data ? JSON.parse(data) : null;
  }

  private async getUserTemplates(userId: string): Promise<BiometricTemplate[]> {
    // Fetch from database
    return [];
  }

  private async getAllUserTemplates(): Promise<any[]> {
    // Fetch all templates for verification
    return [];
  }

  private async getExistingTemplate(
    userId: string,
    type: string,
    fingerType?: string,
    hand?: string
  ): Promise<BiometricTemplate | null> {
    // Check database
    return null;
  }

  private async updateLastUsed(userId: string): Promise<void> {
    // Update database
  }

  private async deleteTemplate(templateId: string): Promise<void> {
    await this.redis.del(`biometric:template:${templateId}`);
  }
}
