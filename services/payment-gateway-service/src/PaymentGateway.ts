import { BiometricPaymentService } from '../../biometric-payment-service/src/BiometricPaymentService';
import { VirtualCardService } from '../../virtual-card-service/src/VirtualCardService';
import { MpesaService } from '../../mpesa-integration-service/src/MpesaService';
import { AuditLogger } from '../../shared/security/src/audit/AuditLogger';

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  paymentMethod: 'biometric' | 'virtual_card' | 'mpesa';
  biometricData?: Buffer;
  cardId?: string;
  phoneNumber?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  receiptNumber?: string;
  message?: string;
}

export class PaymentGateway {
  private biometricService: BiometricPaymentService;
  private virtualCardService: VirtualCardService;
  private mpesaService: MpesaService;
  private auditLogger: AuditLogger;

  constructor(
    encryptionKey: string,
    mpesaConfig: any,
    auditLogger: AuditLogger
  ) {
    this.biometricService = new BiometricPaymentService(encryptionKey);
    this.virtualCardService = new VirtualCardService(encryptionKey);
    this.mpesaService = new MpesaService(mpesaConfig);
    this.auditLogger = auditLogger;
  }

  /**
   * Process payment using selected method
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = crypto.randomUUID();

    try {
      let result: PaymentResponse;

      switch (request.paymentMethod) {
        case 'biometric':
          result = await this.processBiometricPayment(request, transactionId);
          break;
        
        case 'virtual_card':
          result = await this.processVirtualCardPayment(request, transactionId);
          break;
        
        case 'mpesa':
          result = await this.processMpesaPayment(request, transactionId);
          break;
        
        default:
          throw new Error('Invalid payment method');
      }

      // Log transaction
      await this.auditLogger.logTransaction({
        userId: request.userId,
        action: 'payment',
        resourceId: transactionId,
        status: result.success ? 'success' : 'failure',
        metadata: {
          amount: request.amount,
          currency: request.currency,
          merchantId: request.merchantId,
          paymentMethod: request.paymentMethod
        }
      });

      return result;
    } catch (error: any) {
      // Log failure
      await this.auditLogger.logTransaction({
        userId: request.userId,
        action: 'payment',
        resourceId: transactionId,
        status: 'failure',
        metadata: {
          error: error.message,
          amount: request.amount,
          currency: request.currency
        }
      });

      return {
        success: false,
        transactionId,
        amount: request.amount,
        currency: request.currency,
        status: 'failed',
        timestamp: new Date(),
        message: error.message
      };
    }
  }

  /**
   * Process biometric payment (in-store POS)
   */
  private async processBiometricPayment(
    request: PaymentRequest,
    transactionId: string
  ): Promise<PaymentResponse> {
    if (!request.biometricData) {
      throw new Error('Biometric data required');
    }

    // Get user's enrolled biometric templates
    const templates = await this.getUserBiometricTemplates(request.userId);

    // Authorize payment with biometric
    const authorization = await this.biometricService.authorizePayment(
      transactionId,
      request.amount,
      request.currency,
      request.merchantId,
      request.biometricData,
      templates
    );

    if (!authorization.biometricMatch) {
      return {
        success: false,
        transactionId,
        amount: request.amount,
        currency: request.currency,
        status: 'failed',
        timestamp: new Date(),
        message: 'Biometric verification failed'
      };
    }

    // Deduct from user's wallet
    await this.deductFromWallet(request.userId, request.amount, request.currency);

    return {
      success: true,
      transactionId,
      amount: request.amount,
      currency: request.currency,
      status: 'completed',
      timestamp: new Date(),
      message: 'Payment authorized with biometric'
    };
  }

  /**
   * Process virtual card payment (online shopping)
   */
  private async processVirtualCardPayment(
    request: PaymentRequest,
    transactionId: string
  ): Promise<PaymentResponse> {
    if (!request.cardId) {
      throw new Error('Card ID required');
    }

    // Get virtual card
    const card = await this.getVirtualCard(request.cardId, request.userId);

    // Process payment
    const transaction = await this.virtualCardService.processPayment(
      card,
      request.merchantName,
      request.merchantId,
      request.amount,
      request.currency
    );

    if (transaction.status !== 'approved') {
      return {
        success: false,
        transactionId,
        amount: request.amount,
        currency: request.currency,
        status: 'failed',
        timestamp: new Date(),
        message: 'Insufficient balance or card declined'
      };
    }

    // Deduct from card balance
    await this.deductFromCard(request.cardId, transaction.amount);

    return {
      success: true,
      transactionId,
      amount: request.amount,
      currency: request.currency,
      status: 'completed',
      timestamp: new Date(),
      message: 'Payment processed successfully'
    };
  }

  /**
   * Process M-Pesa payment (wallet top-up or direct payment)
   */
  private async processMpesaPayment(
    request: PaymentRequest,
    transactionId: string
  ): Promise<PaymentResponse> {
    if (!request.phoneNumber) {
      throw new Error('Phone number required');
    }

    // Format phone number
    const formattedPhone = this.mpesaService.formatPhoneNumber(request.phoneNumber);

    // Initiate M-Pesa payment
    const mpesaResponse = await this.mpesaService.initiatePayment({
      phoneNumber: formattedPhone,
      amount: request.amount,
      accountReference: transactionId,
      transactionDesc: `Payment to ${request.merchantName}`
    });

    if (!mpesaResponse.success) {
      return {
        success: false,
        transactionId,
        amount: request.amount,
        currency: request.currency,
        status: 'failed',
        timestamp: new Date(),
        message: 'M-Pesa payment initiation failed'
      };
    }

    return {
      success: true,
      transactionId: mpesaResponse.transactionId,
      amount: request.amount,
      currency: request.currency,
      status: 'pending',
      timestamp: new Date(),
      message: 'M-Pesa payment initiated. Check your phone to complete.'
    };
  }

  /**
   * Complete payment flow: M-Pesa → Wallet → Virtual Card → Global Merchant
   */
  async processGlobalPurchase(
    userId: string,
    merchantName: string,
    merchantId: string,
    amountUSD: number,
    phoneNumber: string
  ): Promise<{
    success: boolean;
    steps: string[];
    transactionId: string;
  }> {
    const steps: string[] = [];
    const transactionId = crypto.randomUUID();

    try {
      // Step 1: Calculate KES amount
      const kesAmount = amountUSD / 0.0077; // ~130 KES per USD
      steps.push(`Calculated: $${amountUSD} = KES ${kesAmount.toFixed(2)}`);

      // Step 2: Initiate M-Pesa payment
      const mpesaPayment = await this.processMpesaPayment({
        userId,
        amount: kesAmount,
        currency: 'KES',
        merchantId: 'EAZEPAY',
        merchantName: 'Eazepay Wallet',
        paymentMethod: 'mpesa',
        phoneNumber
      }, transactionId);

      if (!mpesaPayment.success) {
        throw new Error('M-Pesa payment failed');
      }
      steps.push('M-Pesa payment initiated');

      // Step 3: Wait for M-Pesa confirmation (in production, use callback)
      await this.waitForMpesaConfirmation(mpesaPayment.transactionId);
      steps.push('M-Pesa payment confirmed');

      // Step 4: Credit wallet with USD
      await this.creditWallet(userId, amountUSD, 'USD');
      steps.push(`Wallet credited: $${amountUSD}`);

      // Step 5: Get or create virtual card
      let card = await this.getUserVirtualCard(userId);
      if (!card) {
        card = await this.virtualCardService.createVirtualCard(
          userId,
          'Eazepay User',
          { street: '', city: 'Nairobi', state: '', country: 'KE', postalCode: '00100' },
          0,
          'USD'
        );
        steps.push('Virtual card created');
      }

      // Step 6: Load card with USD
      await this.loadCard(card.id, amountUSD);
      steps.push(`Card loaded: $${amountUSD}`);

      // Step 7: Process payment to merchant
      const payment = await this.processVirtualCardPayment({
        userId,
        amount: amountUSD,
        currency: 'USD',
        merchantId,
        merchantName,
        paymentMethod: 'virtual_card',
        cardId: card.id
      }, transactionId);

      if (!payment.success) {
        throw new Error('Merchant payment failed');
      }
      steps.push(`Payment to ${merchantName} completed`);

      return {
        success: true,
        steps,
        transactionId
      };
    } catch (error: any) {
      steps.push(`Error: ${error.message}`);
      return {
        success: false,
        steps,
        transactionId
      };
    }
  }

  // Helper methods (implement based on your database)
  private async getUserBiometricTemplates(userId: string): Promise<any[]> {
    // Fetch from database
    return [];
  }

  private async getVirtualCard(cardId: string, userId: string): Promise<any> {
    // Fetch from database
    return null;
  }

  private async getUserVirtualCard(userId: string): Promise<any> {
    // Fetch from database
    return null;
  }

  private async deductFromWallet(userId: string, amount: number, currency: string): Promise<void> {
    // Update database
  }

  private async creditWallet(userId: string, amount: number, currency: string): Promise<void> {
    // Update database
  }

  private async deductFromCard(cardId: string, amount: number): Promise<void> {
    // Update database
  }

  private async loadCard(cardId: string, amount: number): Promise<void> {
    // Update database
  }

  private async waitForMpesaConfirmation(checkoutRequestId: string): Promise<void> {
    // Poll M-Pesa API or wait for callback
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
