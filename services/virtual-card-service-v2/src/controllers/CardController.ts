import { Request, Response } from 'express';
import { VirtualCardModel } from '../models/VirtualCard';

export class CardController {
  /**
   * Create a new virtual card
   */
  static async createCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardholderName, billingAddress, cardType, currency } = req.body;

      if (!cardholderName) {
        return res.status(400).json({
          success: false,
          error: 'Cardholder name is required'
        });
      }

      if (!billingAddress) {
        return res.status(400).json({
          success: false,
          error: 'Billing address is required'
        });
      }

      const card = await VirtualCardModel.create(
        userId,
        cardholderName,
        billingAddress,
        cardType || 'mastercard',
        currency || 'USD'
      );

      // Get decrypted details for response
      const details = await VirtualCardModel.getCardDetails(card.id);

      res.status(201).json({
        success: true,
        data: {
          cardId: card.id,
          cardNumber: details?.cardNumber,
          cvv: details?.cvv,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardholderName: card.cardholderName,
          cardType: card.cardType,
          balance: card.balance,
          currency: card.currency,
          status: card.status,
          message: 'Virtual card created successfully'
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
   * List user's cards
   */
  static async listCards(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const cards = await VirtualCardModel.findByUserId(userId);

      res.json({
        success: true,
        data: {
          cards: cards.map(card => ({
            cardId: card.id,
            cardType: card.cardType,
            lastFourDigits: '****',  // Masked for security
            cardholderName: card.cardholderName,
            balance: card.balance,
            currency: card.currency,
            status: card.status,
            expiryMonth: card.expiryMonth,
            expiryYear: card.expiryYear,
            createdAt: card.createdAt,
            lastUsedAt: card.lastUsedAt
          })),
          count: cards.length
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
   * Get card details
   */
  static async getCardDetails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const details = await VirtualCardModel.getCardDetails(cardId);

      res.json({
        success: true,
        data: {
          cardId: card.id,
          cardNumber: details?.cardNumber,
          cvv: details?.cvv,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          cardholderName: card.cardholderName,
          cardType: card.cardType,
          balance: card.balance,
          currency: card.currency,
          status: card.status,
          billingAddress: card.billingAddress,
          createdAt: card.createdAt,
          lastUsedAt: card.lastUsedAt
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
   * Get card balance
   */
  static async getBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: {
          balance: card.balance,
          currency: card.currency,
          status: card.status
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
   * Top up card
   */
  static async topUpCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;
      const { amount, sourceCurrency, paymentMethod } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Calculate exchange rate
      const rates: Record<string, number> = {
        'KES': 0.0077,
        'USD': 1,
        'EUR': 1.09,
        'GBP': 1.27
      };

      const sourceRate = rates[sourceCurrency] || 1;
      const targetRate = rates[card.currency] || 1;
      const exchangeRate = sourceRate / targetRate;

      await VirtualCardModel.topUp(cardId, amount, sourceCurrency, exchangeRate);

      const updatedCard = await VirtualCardModel.findById(cardId);

      res.json({
        success: true,
        data: {
          cardId,
          amount,
          sourceCurrency,
          targetCurrency: card.currency,
          exchangeRate,
          convertedAmount: amount * exchangeRate,
          newBalance: updatedCard?.balance,
          message: 'Card topped up successfully'
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
   * Get card transactions
   */
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const transactions = await VirtualCardModel.getTransactions(cardId, limit, offset);

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

  /**
   * Freeze card
   */
  static async freezeCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await VirtualCardModel.updateStatus(cardId, 'frozen');

      res.json({
        success: true,
        message: 'Card frozen successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Unfreeze card
   */
  static async unfreezeCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await VirtualCardModel.updateStatus(cardId, 'active');

      res.json({
        success: true,
        message: 'Card unfrozen successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cancel card
   */
  static async cancelCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { cardId } = req.params;

      const card = await VirtualCardModel.findById(cardId);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Card not found'
        });
      }

      if (card.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      await VirtualCardModel.updateStatus(cardId, 'cancelled');

      res.json({
        success: true,
        message: 'Card cancelled successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
