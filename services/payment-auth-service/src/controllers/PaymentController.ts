import { Request, Response } from 'express';
import { PaymentAuthService } from '../services/PaymentAuthService';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

export const uploadMiddleware = upload.single('biometricData');

export class PaymentController {
  /**
   * Authorize payment with biometric
   */
  static async authorizePayment(req: Request, res: Response) {
    try {
      const { amount, currency, merchantId, merchantName, description } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Biometric data required'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          error: 'Merchant ID required'
        });
      }

      const result = await PaymentAuthService.authorizePayment({
        amount: parseFloat(amount),
        currency: currency || 'KES',
        merchantId,
        merchantName: merchantName || 'Merchant',
        description,
        biometricData: file.buffer
      });

      if (result.authorized) {
        res.json({
          success: true,
          data: {
            authorized: true,
            transactionId: result.transactionId,
            userId: result.userId,
            matchScore: result.matchScore,
            walletBalance: result.walletBalance,
            message: 'Payment authorized successfully'
          }
        });
      } else {
        res.status(402).json({
          success: false,
          error: result.error || 'Payment authorization failed',
          data: {
            authorized: false,
            transactionId: result.transactionId,
            matchScore: result.matchScore,
            walletBalance: result.walletBalance
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
   * Get payment status
   */
  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;

      const status = await PaymentAuthService.getPaymentStatus(transactionId);

      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
