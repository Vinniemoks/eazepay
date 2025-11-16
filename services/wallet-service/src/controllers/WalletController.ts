import { Request, Response } from 'express';
import { WalletModel } from '../models/Wallet';
import { v4 as uuidv4 } from 'uuid';

export class WalletController {
  static async createWallet(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { currency = 'KES' } = req.body;

      // Check if wallet already exists
      const existing = await WalletModel.findByUserId(userId);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Wallet already exists'
        });
      }

      const wallet = await WalletModel.create(userId, currency);

      res.status(201).json({
        success: true,
        data: { wallet }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const wallet = await WalletModel.findByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      res.json({
        success: true,
        data: {
          balance: wallet.balance,
          currency: wallet.currency,
          status: wallet.status
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await WalletModel.getTransactions(userId, limit, offset);

      res.json({
        success: true,
        data: {
          transactions,
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

  static async topup(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, paymentMethod, reference } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      // Check if wallet exists
      const wallet = await WalletModel.findByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      // Credit wallet
      const transaction = await WalletModel.credit(
        userId,
        amount,
        'topup',
        reference || `TOPUP-${uuidv4()}`,
        `Wallet top-up via ${paymentMethod || 'M-Pesa'}`,
        { paymentMethod }
      );

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async payment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, merchantId, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      // Check if wallet exists
      const wallet = await WalletModel.findByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      // Debit wallet
      const transaction = await WalletModel.debit(
        userId,
        amount,
        'payment',
        `PAY-${uuidv4()}`,
        description || 'Payment',
        { merchantId }
      );

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
