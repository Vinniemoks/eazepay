// Financial Analytics Controller
// Task: 5.3, 5.4 - Financial summary and detailed analytics
// Requirements: 2.2, 2.5, 2.6, 10.1-10.7

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionStatus } from '../models/Transaction';
import { Between } from 'typeorm';
import Decimal from 'decimal.js';

export class AnalyticsController {
  // Get financial summary
  async getFinancialSummary(req: Request, res: Response) {
    try {
      const { period = 'day', startDate, endDate } = req.query;

      const txRepo = AppDataSource.getRepository(Transaction);

      // Calculate date range
      const { start, end, previousStart, previousEnd } = this.calculateDateRange(
        period as string,
        startDate as string,
        endDate as string
      );

      // Current period stats
      const currentStats = await this.calculatePeriodStats(txRepo, start, end);

      // Previous period stats for comparison
      const previousStats = await this.calculatePeriodStats(txRepo, previousStart, previousEnd);

      // Calculate percentage changes
      const volumeChange = this.calculatePercentageChange(
        parseFloat(currentStats.totalVolume),
        parseFloat(previousStats.totalVolume)
      );
      const revenueChange = this.calculatePercentageChange(
        parseFloat(currentStats.totalRevenue),
        parseFloat(previousStats.totalRevenue)
      );
      const countChange = this.calculatePercentageChange(
        currentStats.transactionCount,
        previousStats.transactionCount
      );

      res.json({
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        summary: {
          totalVolume: currentStats.totalVolume,
          totalRevenue: currentStats.totalRevenue,
          totalFees: currentStats.totalFees,
          transactionCount: currentStats.transactionCount,
          averageTransactionValue: currentStats.averageTransactionValue,
          successRate: currentStats.successRate
        },
        comparison: {
          volumeChange,
          revenueChange,
          transactionCountChange: countChange
        },
        previousPeriod: {
          totalVolume: previousStats.totalVolume,
          totalRevenue: previousStats.totalRevenue,
          transactionCount: previousStats.transactionCount
        }
      });
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
  }

  // Get detailed analytics
  async getDetailedAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const txRepo = AppDataSource.getRepository(Transaction);

      // Get transactions grouped by time period
      const query = `
        SELECT 
          DATE_TRUNC($1, timestamp) as period,
          COUNT(*) as transaction_count,
          SUM(amount) as total_volume,
          SUM(fees) as total_fees,
          AVG(amount) as avg_transaction_value,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::float / COUNT(*)::float * 100 as success_rate
        FROM transactions
        WHERE timestamp >= $2 AND timestamp <= $3
        GROUP BY DATE_TRUNC($1, timestamp)
        ORDER BY period ASC
      `;

      const results = await AppDataSource.query(query, [
        groupBy,
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate || new Date()
      ]);

      // Get transaction type breakdown
      const typeBreakdown = await txRepo
        .createQueryBuilder('tx')
        .select('tx.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(tx.amount)', 'total')
        .where('tx.timestamp >= :startDate', { startDate })
        .andWhere('tx.timestamp <= :endDate', { endDate })
        .groupBy('tx.type')
        .getRawMany();

      res.json({
        timeSeries: results,
        typeBreakdown,
        groupBy
      });
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      res.status(500).json({ error: 'Failed to fetch detailed analytics' });
    }
  }

  // Helper: Calculate period stats
  private async calculatePeriodStats(repo: any, start: Date, end: Date) {
    const result = await repo
      .createQueryBuilder('tx')
      .select('COUNT(*)', 'transactionCount')
      .addSelect('SUM(tx.amount)', 'totalVolume')
      .addSelect('SUM(tx.amount + tx.fees)', 'totalRevenue')
      .addSelect('SUM(tx.fees)', 'totalFees')
      .addSelect('AVG(tx.amount)', 'averageTransactionValue')
      .addSelect(
        'COUNT(CASE WHEN tx.status = :completedStatus THEN 1 END)::float / COUNT(*)::float * 100',
        'successRate'
      )
      .where('tx.timestamp >= :start', { start })
      .andWhere('tx.timestamp <= :end', { end })
      .setParameter('completedStatus', TransactionStatus.COMPLETED)
      .getRawOne();

    return {
      transactionCount: parseInt(result.transactionCount) || 0,
      totalVolume: result.totalVolume || '0.00',
      totalRevenue: result.totalRevenue || '0.00',
      totalFees: result.totalFees || '0.00',
      averageTransactionValue: result.averageTransactionValue || '0.00',
      successRate: parseFloat(result.successRate) || 0
    };
  }

  // Helper: Calculate date range
  private calculateDateRange(period: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date, end: Date, previousStart: Date, previousEnd: Date;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      const duration = end.getTime() - start.getTime();
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - duration);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          previousStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
          previousEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = now;
          previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousEnd = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = now;
          previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          end = now;
          previousStart = new Date(now.getFullYear() - 1, 0, 1);
          previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
          break;
        default:
          start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          end = now;
          previousStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
          previousEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    return { start, end, previousStart, previousEnd };
  }

  // Helper: Calculate percentage change
  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
}
