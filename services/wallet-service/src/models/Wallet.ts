import { query, pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'credit' | 'debit';
  category: 'topup' | 'payment' | 'withdrawal' | 'refund' | 'fee' | 'transfer';
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  description?: string;
  metadata?: any;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  createdAt: Date;
}

export class WalletModel {
  static async create(userId: string, currency: string = 'KES'): Promise<Wallet> {
    const result = await query(
      'INSERT INTO wallets (user_id, currency) VALUES ($1, $2) RETURNING *',
      [userId, currency]
    );
    return this.mapToWallet(result.rows[0]);
  }

  static async findByUserId(userId: string): Promise<Wallet | null> {
    const result = await query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    return result.rows[0] ? this.mapToWallet(result.rows[0]) : null;
  }

  static async findById(id: string): Promise<Wallet | null> {
    const result = await query('SELECT * FROM wallets WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToWallet(result.rows[0]) : null;
  }

  static async getBalance(userId: string): Promise<number> {
    const result = await query('SELECT balance FROM wallets WHERE user_id = $1', [userId]);
    return result.rows[0]?.balance || 0;
  }

  static async credit(
    userId: string,
    amount: number,
    category: string,
    reference: string,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get wallet with lock
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (walletResult.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      const wallet = walletResult.rows[0];
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      // Update balance
      await client.query(
        'UPDATE wallets SET balance = $1 WHERE id = $2',
        [balanceAfter, wallet.id]
      );

      // Create transaction record
      const txResult = await client.query(
        `INSERT INTO transactions 
         (wallet_id, user_id, type, category, amount, currency, balance_before, balance_after, reference, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [wallet.id, userId, 'credit', category, amount, wallet.currency, balanceBefore, balanceAfter, reference, description, JSON.stringify(metadata || {})]
      );

      await client.query('COMMIT');

      return this.mapToTransaction(txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async debit(
    userId: string,
    amount: number,
    category: string,
    reference: string,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get wallet with lock
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );

      if (walletResult.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      const wallet = walletResult.rows[0];
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore - amount;

      // Check sufficient balance
      if (balanceAfter < 0) {
        throw new Error('Insufficient balance');
      }

      // Update balance
      await client.query(
        'UPDATE wallets SET balance = $1 WHERE id = $2',
        [balanceAfter, wallet.id]
      );

      // Create transaction record
      const txResult = await client.query(
        `INSERT INTO transactions 
         (wallet_id, user_id, type, category, amount, currency, balance_before, balance_after, reference, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [wallet.id, userId, 'debit', category, amount, wallet.currency, balanceBefore, balanceAfter, reference, description, JSON.stringify(metadata || {})]
      );

      await client.query('COMMIT');

      return this.mapToTransaction(txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTransactions(userId: string, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    const result = await query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows.map(this.mapToTransaction);
  }

  static async getTransactionByReference(reference: string): Promise<Transaction | null> {
    const result = await query('SELECT * FROM transactions WHERE reference = $1', [reference]);
    return result.rows[0] ? this.mapToTransaction(result.rows[0]) : null;
  }

  private static mapToWallet(row: any): Wallet {
    return {
      id: row.id,
      userId: row.user_id,
      balance: parseFloat(row.balance),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private static mapToTransaction(row: any): Transaction {
    return {
      id: row.id,
      walletId: row.wallet_id,
      userId: row.user_id,
      type: row.type,
      category: row.category,
      amount: parseFloat(row.amount),
      currency: row.currency,
      balanceBefore: parseFloat(row.balance_before),
      balanceAfter: parseFloat(row.balance_after),
      reference: row.reference,
      description: row.description,
      metadata: row.metadata,
      status: row.status,
      createdAt: row.created_at
    };
  }
}
