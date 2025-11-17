import { query, pool } from '../config/database';
import crypto from 'crypto';

export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string; // Encrypted
  cvv: string; // Encrypted
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  cardType: 'mastercard' | 'visa';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'expired' | 'cancelled';
  billingAddress: any;
  issuerCardId?: string; // External card issuer ID
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  userId: string;
  merchantName: string;
  merchantId: string;
  merchantCategory: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  status: 'pending' | 'approved' | 'declined' | 'reversed';
  declineReason?: string;
  authorizationCode?: string;
  metadata?: any;
  createdAt: Date;
}

export class VirtualCardModel {
  /**
   * Create a new virtual card
   */
  static async create(
    userId: string,
    cardholderName: string,
    billingAddress: any,
    cardType: 'mastercard' | 'visa' = 'mastercard',
    currency: string = 'USD'
  ): Promise<VirtualCard> {
    // Generate card number (will be replaced by issuer's card number)
    const cardNumber = this.generateCardNumber(cardType);
    const cvv = this.generateCVV();
    
    // Set expiry (3 years from now)
    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    // Encrypt sensitive data
    const encryptedCardNumber = this.encryptData(cardNumber);
    const encryptedCVV = this.encryptData(cvv);

    const result = await query(
      `INSERT INTO virtual_cards 
       (user_id, card_number, cvv, expiry_month, expiry_year, cardholder_name, card_type, currency, billing_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, encryptedCardNumber, encryptedCVV, expiryMonth, expiryYear, cardholderName, cardType, currency, JSON.stringify(billingAddress)]
    );

    return this.mapToCard(result.rows[0]);
  }

  /**
   * Get card by ID
   */
  static async findById(cardId: string): Promise<VirtualCard | null> {
    const result = await query('SELECT * FROM virtual_cards WHERE id = $1', [cardId]);
    return result.rows[0] ? this.mapToCard(result.rows[0]) : null;
  }

  /**
   * Get cards by user ID
   */
  static async findByUserId(userId: string): Promise<VirtualCard[]> {
    const result = await query(
      'SELECT * FROM virtual_cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(this.mapToCard);
  }

  /**
   * Get decrypted card details (for display/use)
   */
  static async getCardDetails(cardId: string): Promise<{
    cardNumber: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
  } | null> {
    const card = await this.findById(cardId);
    if (!card) return null;

    return {
      cardNumber: this.decryptData(card.cardNumber),
      cvv: this.decryptData(card.cvv),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardholderName: card.cardholderName
    };
  }

  /**
   * Update card balance
   */
  static async updateBalance(cardId: string, newBalance: number): Promise<void> {
    await query(
      'UPDATE virtual_cards SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newBalance, cardId]
    );
  }

  /**
   * Top up card balance
   */
  static async topUp(
    cardId: string,
    amount: number,
    sourceCurrency: string,
    exchangeRate: number
  ): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get card with lock
      const cardResult = await client.query(
        'SELECT * FROM virtual_cards WHERE id = $1 FOR UPDATE',
        [cardId]
      );

      if (cardResult.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = cardResult.rows[0];
      const currentBalance = parseFloat(card.balance);
      const convertedAmount = amount * exchangeRate;
      const newBalance = currentBalance + convertedAmount;

      // Update balance
      await client.query(
        'UPDATE virtual_cards SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, cardId]
      );

      // Log top-up transaction
      await client.query(
        `INSERT INTO card_topups 
         (card_id, amount, source_currency, target_currency, exchange_rate, balance_after)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cardId, amount, sourceCurrency, card.currency, exchangeRate, newBalance]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process card transaction
   */
  static async processTransaction(
    cardId: string,
    merchantName: string,
    merchantId: string,
    merchantCategory: string,
    amount: number,
    currency: string,
    metadata?: any
  ): Promise<CardTransaction> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get card with lock
      const cardResult = await client.query(
        'SELECT * FROM virtual_cards WHERE id = $1 FOR UPDATE',
        [cardId]
      );

      if (cardResult.rows.length === 0) {
        throw new Error('Card not found');
      }

      const card = cardResult.rows[0];
      
      // Check card status
      if (card.status !== 'active') {
        const txn = await this.createTransaction(
          client,
          cardId,
          card.user_id,
          merchantName,
          merchantId,
          merchantCategory,
          amount,
          currency,
          'declined',
          'Card not active'
        );
        await client.query('COMMIT');
        return txn;
      }

      // Convert currency if needed
      let finalAmount = amount;
      let exchangeRate: number | undefined;
      
      if (currency !== card.currency) {
        const conversion = await this.convertCurrency(amount, currency, card.currency);
        finalAmount = conversion.amount;
        exchangeRate = conversion.rate;
      }

      // Check balance
      const currentBalance = parseFloat(card.balance);
      if (finalAmount > currentBalance) {
        const txn = await this.createTransaction(
          client,
          cardId,
          card.user_id,
          merchantName,
          merchantId,
          merchantCategory,
          finalAmount,
          card.currency,
          'declined',
          'Insufficient balance',
          amount,
          currency,
          exchangeRate
        );
        await client.query('COMMIT');
        return txn;
      }

      // Debit card
      const newBalance = currentBalance - finalAmount;
      await client.query(
        'UPDATE virtual_cards SET balance = $1, last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newBalance, cardId]
      );

      // Create approved transaction
      const txn = await this.createTransaction(
        client,
        cardId,
        card.user_id,
        merchantName,
        merchantId,
        merchantCategory,
        finalAmount,
        card.currency,
        'approved',
        undefined,
        amount,
        currency,
        exchangeRate,
        metadata
      );

      await client.query('COMMIT');
      return txn;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get card transactions
   */
  static async getTransactions(
    cardId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CardTransaction[]> {
    const result = await query(
      'SELECT * FROM card_transactions WHERE card_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [cardId, limit, offset]
    );
    return result.rows.map(this.mapToTransaction);
  }

  /**
   * Freeze/unfreeze card
   */
  static async updateStatus(cardId: string, status: string): Promise<void> {
    await query(
      'UPDATE virtual_cards SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, cardId]
    );
  }

  // Private helper methods

  private static async createTransaction(
    client: any,
    cardId: string,
    userId: string,
    merchantName: string,
    merchantId: string,
    merchantCategory: string,
    amount: number,
    currency: string,
    status: string,
    declineReason?: string,
    originalAmount?: number,
    originalCurrency?: string,
    exchangeRate?: number,
    metadata?: any
  ): Promise<CardTransaction> {
    const authCode = status === 'approved' ? this.generateAuthCode() : undefined;
    
    const result = await client.query(
      `INSERT INTO card_transactions 
       (card_id, user_id, merchant_name, merchant_id, merchant_category, amount, currency, 
        original_amount, original_currency, exchange_rate, status, decline_reason, authorization_code, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [cardId, userId, merchantName, merchantId, merchantCategory, amount, currency,
       originalAmount, originalCurrency, exchangeRate, status, declineReason, authCode, JSON.stringify(metadata || {})]
    );

    return this.mapToTransaction(result.rows[0]);
  }

  private static generateCardNumber(cardType: 'mastercard' | 'visa'): string {
    // BIN ranges: Mastercard (51-55), Visa (4)
    const bin = cardType === 'mastercard' ? '5399' : '4111';
    let cardNumber = bin;
    
    // Add 11 random digits
    for (let i = 0; i < 11; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    
    // Calculate and add Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    cardNumber += checkDigit;
    
    return cardNumber;
  }

  private static calculateLuhnCheckDigit(cardNumber: string): number {
    let sum = 0;
    let isEven = true;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return (10 - (sum % 10)) % 10;
  }

  private static generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  private static generateAuthCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ amount: number; rate: number }> {
    // Simplified exchange rates (use real API in production)
    const rates: Record<string, Record<string, number>> = {
      'KES': { 'USD': 0.0077, 'EUR': 0.0071, 'GBP': 0.0061 },
      'USD': { 'KES': 130, 'EUR': 0.92, 'GBP': 0.79 },
      'EUR': { 'KES': 141, 'USD': 1.09, 'GBP': 0.86 },
      'GBP': { 'KES': 164, 'USD': 1.27, 'EUR': 1.16 }
    };

    if (fromCurrency === toCurrency) {
      return { amount, rate: 1 };
    }

    const rate = rates[fromCurrency]?.[toCurrency] || 1;
    return {
      amount: amount * rate,
      rate
    };
  }

  private static encryptData(data: string): string {
    // In production, use proper encryption (AES-256-GCM)
    // For now, just base64 encode
    return Buffer.from(data).toString('base64');
  }

  private static decryptData(data: string): string {
    // In production, use proper decryption
    return Buffer.from(data, 'base64').toString();
  }

  private static mapToCard(row: any): VirtualCard {
    return {
      id: row.id,
      userId: row.user_id,
      cardNumber: row.card_number,
      cvv: row.cvv,
      expiryMonth: row.expiry_month,
      expiryYear: row.expiry_year,
      cardholderName: row.cardholder_name,
      cardType: row.card_type,
      balance: parseFloat(row.balance),
      currency: row.currency,
      status: row.status,
      billingAddress: row.billing_address,
      issuerCardId: row.issuer_card_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsedAt: row.last_used_at
    };
  }

  private static mapToTransaction(row: any): CardTransaction {
    return {
      id: row.id,
      cardId: row.card_id,
      userId: row.user_id,
      merchantName: row.merchant_name,
      merchantId: row.merchant_id,
      merchantCategory: row.merchant_category,
      amount: parseFloat(row.amount),
      currency: row.currency,
      originalAmount: row.original_amount ? parseFloat(row.original_amount) : undefined,
      originalCurrency: row.original_currency,
      exchangeRate: row.exchange_rate ? parseFloat(row.exchange_rate) : undefined,
      status: row.status,
      declineReason: row.decline_reason,
      authorizationCode: row.authorization_code,
      metadata: row.metadata,
      createdAt: row.created_at
    };
  }
}
