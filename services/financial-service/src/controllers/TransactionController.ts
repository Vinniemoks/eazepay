// Transaction Controller with millisecond precision
// Task: 5.1, 5.2 - Transaction recording and search
// Requirements: 2.1, 9.1-9.3, 24.1-24.5

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction';
import { Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import Decimal from 'decimal.js';

export class TransactionController {
  // Record transaction with idempotency
  async recordTransaction(req: Request, res: Response) {
    try {
      const {
        type,
        amount,
        currency,
        fromUserId,
        toUserId,
        description,
        metadata
      } = req.body;

      // Validate idempotency key
      const idempotencyKey = req.headers['idempotency-key'] as string;
      if (!idempotencyKey) {
        return res.status(400).json({
          error: 'Idempotency-Key header required',
          code: 'FIN_002'
        });
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idempotencyKey)) {
        return res.status(400).json({
          error: 'Invalid idempotency key format. Must be UUIDv4',
          code: 'FIN_002'
        });
      }

      const txRepo = AppDataSource.getRepository(Transaction);

      // Check if transaction with this idempotency key already exists
      const existing = await txRepo.findOne({
        where: { idempotencyKey }
      });

      if (existing) {
        // Return cached response (idempotent)
        return res.status(200).json({
          message: 'Transaction already recorded (idempotent)',
          transaction: existing,
          idempotent: true
        });
      }

      // Validate amount
      const amountDecimal = new Decimal(amount);
      if (amountDecimal.lessThanOrEqualTo(0)) {
        return res.status(400).json({
          error: 'Amount must be greater than zero'
        });
      }

      // Create transaction with millisecond-precision timestamp
      const transaction = txRepo.create({
        timestamp: new Date(), // Will be stored with millisecond precision
        type,
        amount: amountDecimal.toFixed(2),
        currency: currency || 'KES',
        fromUserId,
        toUserId,
        status: TransactionStatus.PENDING,
        fees: '0.00',
        description,
        metadata,
        idempotencyKey
      });

      await txRepo.save(transaction);

      res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction: {
          id: transaction.id,
          timestamp: transaction.timestamp.toISOString(), // ISO 8601 with milliseconds
          sequenceNumber: transaction.sequenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          idempotencyKey: transaction.idempotencyKey
        }
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
      res.status(500).json({ 
        error: 'Failed to record transaction',
        code: 'FIN_001'
      });
    }
  }

  // Search transactions with filtering
  async searchTransactions(req: Request, res: Response) {
    try {
      const {
        startDate,
        endDate,
        minAmount,
        maxAmount,
        type,
        status,
        userId,
        currency,
        page = 1,
        limit = 50,
        timezone = 'UTC'
      } = req.query;

      const txRepo = AppDataSource.getRepository(Transaction);
      let query = txRepo.createQueryBuilder('tx');

      // Date range filter
      if (startDate) {
        query = query.andWhere('tx.timestamp >= :startDate', { startDate });
      }
      if (endDate) {
        query = query.andWhere('tx.timestamp <= :endDate', { endDate });
      }

      // Amount range filter
      if (minAmount) {
        query = query.andWhere('tx.amount >= :minAmount', { minAmount });
      }
      if (maxAmount) {
        query = query.andWhere('tx.amount <= :maxAmount', { maxAmount });
      }

      // Type filter
      if (type) {
        const types = Array.isArray(type) ? type : [type];
        query = query.andWhere('tx.type IN (:...types)', { types });
      }

      // Status filter
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        query = query.andWhere('tx.status IN (:...statuses)', { statuses });
      }

      // User filter (from or to)
      if (userId) {
        query = query.andWhere(
          '(tx.fromUserId = :userId OR tx.toUserId = :userId)',
          { userId }
        );
      }

      // Currency filter
      if (currency) {
        query = query.andWhere('tx.currency = :currency', { currency });
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Get total count
      const total = await query.getCount();

      // Get transactions
      const transactions = await query
        .orderBy('tx.timestamp', 'DESC')
        .skip(offset)
        .take(limitNum)
        .getMany();

      // Format timestamps with timezone
      const formattedTransactions = transactions.map(tx => ({
        ...tx,
        timestamp: tx.timestamp.toISOString(),
        timestampLocal: this.convertToTimezone(tx.timestamp, timezone as string)
      }));

      res.json({
        transactions: formattedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error searching transactions:', error);
      res.status(500).json({ 
        error: 'Failed to search transactions',
        code: 'FIN_001'
      });
    }
  }

  // Get transaction by ID
  async getTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { timezone = 'UTC' } = req.query;

      const txRepo = AppDataSource.getRepository(Transaction);
      const transaction = await txRepo.findOne({ where: { id } });

      if (!transaction) {
        return res.status(404).json({ 
          error: 'Transaction not found',
          code: 'FIN_001'
        });
      }

      res.json({
        transaction: {
          ...transaction,
          timestamp: transaction.timestamp.toISOString(),
          timestampLocal: this.convertToTimezone(transaction.timestamp, timezone as string)
        }
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ 
        error: 'Failed to fetch transaction',
        code: 'FIN_001'
      });
    }
  }

  // Helper: Convert timestamp to timezone
  private convertToTimezone(date: Date, timezone: string): string {
    try {
      return date.toLocaleString('en-US', { 
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false
      });
    } catch (error) {
      // Invalid timezone, return UTC
      return date.toISOString();
    }
  }
}
