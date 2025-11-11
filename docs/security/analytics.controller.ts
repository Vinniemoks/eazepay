import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction } from '../entities/Transaction';
import logger from '../utils/logger';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // In a real application, this would be a more complex and optimized query.
    // For demonstration, we'll perform some basic aggregations.

    const totalVolume = await transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const transactionCount = await transactionRepository.count();

    const successfulTransactions = await transactionRepository.count({ where: { status: 'completed' } });

    const summary = {
      totalTransactionVolume: parseFloat(totalVolume.total) || 0,
      totalTransactions: transactionCount,
      successfulTransactions: successfulTransactions,
      failedTransactions: transactionCount - successfulTransactions,
      successRate: transactionCount > 0 ? (successfulTransactions / transactionCount) * 100 : 0,
    };

    res.status(200).json(summary);
  } catch (error: any) {
    logger.error('Failed to get dashboard summary', { error: error.message });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};