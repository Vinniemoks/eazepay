import { Request, Response } from 'express';
import { MpesaService } from '../services/MpesaService';
import axios from 'axios';

const mpesaService = new MpesaService();
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8003';

export class MpesaController {
  static async initiatePayment(req: Request, res: Response) {
    try {
      const { phoneNumber, amount, accountReference, transactionDesc } = req.body;
      const userId = (req as any).user.userId;

      // Validate phone number
      if (!mpesaService.validatePhoneNumber(phoneNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format. Use 254XXXXXXXXX'
        });
      }

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      // Initiate STK Push
      const result = await mpesaService.initiateSTKPush({
        phoneNumber,
        amount,
        accountReference: accountReference || `TOPUP-${userId}`,
        transactionDesc: transactionDesc || 'Wallet Top-up'
      });

      res.json({
        success: true,
        data: result,
        message: 'Payment initiated. Please check your phone to complete the transaction.'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async queryTransaction(req: Request, res: Response) {
    try {
      const { checkoutRequestId } = req.params;

      const result = await mpesaService.queryTransaction(checkoutRequestId);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async handleCallback(req: Request, res: Response) {
    try {
      console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

      const { Body } = req.body;
      const { stkCallback } = Body;

      const {
        MerchantRequestID,
        CheckoutRequestID,
        ResultCode,
        ResultDesc,
        CallbackMetadata
      } = stkCallback;

      // Success
      if (ResultCode === 0) {
        const metadata = CallbackMetadata.Item;
        const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

        console.log('Payment successful:', {
          amount,
          mpesaReceiptNumber,
          phoneNumber
        });

        // TODO: Credit user wallet
        // This would require extracting userId from accountReference
        // For now, just log it
        
        res.json({
          ResultCode: 0,
          ResultDesc: 'Success'
        });
      } else {
        // Failed
        console.log('Payment failed:', ResultDesc);
        
        res.json({
          ResultCode: 0,
          ResultDesc: 'Success'
        });
      }
    } catch (error: any) {
      console.error('Callback error:', error);
      res.json({
        ResultCode: 1,
        ResultDesc: 'Failed'
      });
    }
  }
}
