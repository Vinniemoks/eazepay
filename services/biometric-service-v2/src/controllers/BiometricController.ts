import { Request, Response } from 'express';
import { BiometricTemplateModel } from '../models/BiometricTemplate';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

export const uploadMiddleware = upload.single('biometricData');

export class BiometricController {
  /**
   * Enroll a new biometric template
   */
  static async enroll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { biometricType, fingerType, hand, isPrimary } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No biometric data provided'
        });
      }

      // Validate biometric type
      if (!['fingerprint', 'palm', 'face'].includes(biometricType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid biometric type'
        });
      }

      // Validate fingerprint-specific fields
      if (biometricType === 'fingerprint') {
        if (!fingerType || !hand) {
          return res.status(400).json({
            success: false,
            error: 'Finger type and hand are required for fingerprints'
          });
        }
      }

      const template = await BiometricTemplateModel.enroll(
        userId,
        biometricType,
        file.buffer,
        fingerType,
        hand,
        isPrimary === 'true' || isPrimary === true
      );

      res.status(201).json({
        success: true,
        data: {
          templateId: template.id,
          biometricType: template.biometricType,
          fingerType: template.fingerType,
          hand: template.hand,
          isPrimary: template.isPrimary,
          qualityScore: template.qualityScore,
          enrolledAt: template.enrolledAt
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
   * Verify biometric for authentication
   */
  static async verify(req: Request, res: Response) {
    try {
      const file = req.file;
      const { userId, transactionId } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No biometric data provided'
        });
      }

      const result = await BiometricTemplateModel.verify(
        file.buffer,
        userId,
        transactionId
      );

      if (result.success) {
        res.json({
          success: true,
          data: {
            verified: true,
            userId: result.userId,
            matchScore: result.matchScore,
            message: 'Biometric verified successfully'
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Biometric verification failed',
          data: {
            verified: false,
            matchScore: result.matchScore
          }
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get enrolled templates for user
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const templates = await BiometricTemplateModel.getByUserId(userId);

      res.json({
        success: true,
        data: {
          templates: templates.map(t => ({
            id: t.id,
            biometricType: t.biometricType,
            fingerType: t.fingerType,
            hand: t.hand,
            isPrimary: t.isPrimary,
            qualityScore: t.qualityScore,
            enrolledAt: t.enrolledAt,
            lastUsedAt: t.lastUsedAt
          })),
          count: templates.length
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
   * Delete a template
   */
  static async deleteTemplate(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { templateId } = req.params;

      // Verify template belongs to user
      const templates = await BiometricTemplateModel.getByUserId(userId);
      const template = templates.find(t => t.id === templateId);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      await BiometricTemplateModel.delete(templateId);

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get enrollment status
   */
  static async getEnrollmentStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const count = await BiometricTemplateModel.getEnrollmentCount(userId);
      const primary = await BiometricTemplateModel.getPrimaryTemplate(userId);

      res.json({
        success: true,
        data: {
          enrolledCount: count,
          hasPrimary: !!primary,
          primaryTemplate: primary ? {
            id: primary.id,
            biometricType: primary.biometricType,
            fingerType: primary.fingerType,
            hand: primary.hand
          } : null
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
