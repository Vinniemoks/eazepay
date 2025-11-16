import crypto from 'crypto';
import { DataEncryption } from '../../shared/security/src/encryption/DataEncryption';

export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string; // Encrypted
  cvv: string; // Encrypted
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'expired';
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  userId: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  status: 'pending' | 'approved' | 'declined';
  timestamp: Date;
}

export class VirtualCardService {
  private encryption: DataEncryption;
  private cardBin: string = '5399'; // Virtual card BIN (Mastercard)

  constructor(encryptionKey: string) {
    this.encryption = new DataEncryption(encryptionKey);
  }

  /**
   * Create virtual card for user (intermediary for global payments)
   */
  async createVirtualCard(
    userId: string,
    cardholderName: string,
    billingAddress: any,
    initialBalance: number = 0,
    currency: string = 'USD'
  ): Promise<VirtualCard> {
    // Generate card number
    const cardNumber = this.generateCardNumber();
    
    // Generate CVV
    const cvv = this.generateCVV();
    
    // Set expiry (3 years from now)
    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    // Encrypt sensitive data
    const encryptedCardNumber = this.encryption.encrypt(cardNumber);
    const encryptedCVV = this.encryption.encrypt(cvv);

    return {
      id: crypto.randomUUID(),
      userId,
      cardNumber: encryptedCardNumber,
      cvv: encryptedCVV,
      expiryMonth,
      expiryYear,
      cardholderName,
      billingAddress,
      balance: initialBalance,
      currency,
      status: 'active',
      createdAt: new Date()
    };
  }

  /**
   * Get decrypted card details for payment
   */
  async getCardDetails(card: VirtualCard): Promise<{
    cardNumber: string;
    cvv: string;
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
  }> {
    return {
      cardNumber: this.encryption.decrypt(card.cardNumber),
      cvv: this.encryption.decrypt(card.cvv),
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardholderName: card.cardholderName
    };
  }

  /**
   * Process payment using virtual card
   */
  async processPayment(
    card: VirtualCard,
    merchantName: string,
    merchantId: string,
    amount: number,
    currency: string
  ): Promise<CardTransaction> {
    const transactionId = crypto.randomUUID();

    // Check if card is active
    if (card.status !== 'active') {
      return {
        id: transactionId,
        cardId: card.id,
        userId: card.userId,
        merchantName,
        merchantId,
        amount,
        currency,
        status: 'declined',
        timestamp: new Date()
      };
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
    if (finalAmount > card.balance) {
      return {
        id: transactionId,
        cardId: card.id,
        userId: card.userId,
        merchantName,
        merchantId,
        amount: finalAmount,
        currency: card.currency,
        originalAmount: amount,
        originalCurrency: currency,
        exchangeRate,
        status: 'declined',
        timestamp: new Date()
      };
    }

    // Approve transaction
    return {
      id: transactionId,
      cardId: card.id,
      userId: card.userId,
      merchantName,
      merchantId,
      amount: finalAmount,
      currency: card.currency,
      originalAmount: amount,
      originalCurrency: currency,
      exchangeRate,
      status: 'approved',
      timestamp: new Date()
    };
  }

  /**
   * Top up virtual card from M-Pesa/Airtel Money
   */
  async topUpCard(
    cardId: string,
    amount: number,
    sourceCurrency: string,
    paymentMethod: 'mpesa' | 'airtel' | 'telkom',
    phoneNumber: string
  ): Promise<{
    success: boolean;
    transactionId: string;
    convertedAmount: number;
    exchangeRate: number;
  }> {
    // Convert KES to USD (or card currency)
    const conversion = await this.convertCurrency(amount, sourceCurrency, 'USD');
    
    return {
      success: true,
      transactionId: crypto.randomUUID(),
      convertedAmount: conversion.amount,
      exchangeRate: conversion.rate
    };
  }

  /**
   * Generate valid card number using Luhn algorithm
   */
  private generateCardNumber(): string {
    // Start with BIN
    let cardNumber = this.cardBin;
    
    // Add 11 random digits
    for (let i = 0; i < 11; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    
    // Calculate and add Luhn check digit
    const checkDigit = this.calculateLuhnCheckDigit(cardNumber);
    cardNumber += checkDigit;
    
    return cardNumber;
  }

  /**
   * Calculate Luhn check digit
   */
  private calculateLuhnCheckDigit(cardNumber: string): number {
    let sum = 0;
    let isEven = true;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (10 - (sum % 10)) % 10;
  }

  /**
   * Generate CVV
   */
  private generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  /**
   * Convert currency (simplified - use real exchange rate API in production)
   */
  private async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{ amount: number; rate: number }> {
    // Simplified exchange rates (use real API like Fixer.io, CurrencyLayer, etc.)
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

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
  }
}
