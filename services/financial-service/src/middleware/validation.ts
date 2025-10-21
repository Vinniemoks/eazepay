// Validation middleware
import { Request, Response, NextFunction } from 'express';
import { TransactionType } from '../models/Transaction';

export const validateTransaction = (req: Request, res: Response, next: NextFunction) => {
  const { type, amount, currency, fromUserId, toUserId } = req.body;

  // Validate type
  if (!type || !Object.values(TransactionType).includes(type)) {
    return res.status(400).json({
      error: 'Invalid transaction type',
      code: 'VAL_001',
      validTypes: Object.values(TransactionType)
    });
  }

  // Validate amount
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid amount. Must be a positive number',
      code: 'VAL_002'
    });
  }

  // Validate currency (optional, defaults to KES)
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    return res.status(400).json({
      error: 'Invalid currency code. Must be 3-letter ISO code',
      code: 'VAL_003'
    });
  }

  // Validate user IDs based on transaction type
  if (type === TransactionType.TRANSFER) {
    if (!fromUserId || !toUserId) {
      return res.status(400).json({
        error: 'Transfer requires both fromUserId and toUserId',
        code: 'VAL_004'
      });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({
        error: 'Cannot transfer to the same user',
        code: 'VAL_005'
      });
    }
  }

  next();
};
