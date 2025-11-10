import { body, param, query } from 'express-validator';


export const createTransactionValidator = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('currency').isString().withMessage('Currency is required'),
  body('recipientId').isString().withMessage('Recipient ID is required'),
  body('senderId').isString().withMessage('Sender ID is required'),
];

export const getTransactionValidator = [
  param('transactionId').isString().withMessage('Transaction ID is required'),
];

export const getAnalyticsValidator = [
  query('startDate').isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];