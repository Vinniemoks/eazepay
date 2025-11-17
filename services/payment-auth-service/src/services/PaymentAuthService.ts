import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

const BIOMETRIC_SERVICE_URL = process.env.BIOMETRIC_SERVICE_URL || 'http://localhost:8001';
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:8003';

export interface PaymentAuthRequest {
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  description?: string;
  biometricData: Buffer;
}

export interface PaymentAuthResponse {
  authorized: boolean;
  transactionId: string;
  userId?: string;
  matchScore?: number;
  walletBalance?: number;
  error?: string;
}

export class PaymentAuthService {
  /**
   * Authorize payment using biometric verification
   */
  static async authorizePayment(request: PaymentAuthRequest): Promise<PaymentAuthResponse> {
    const transactionId = `PAY-${uuidv4()}`;

    try {
      // Step 1: Verify biometric (1:N matching)
      console.log('Step 1: Verifying biometric...');
      const formData = new FormData();
      formData.append('biometricData', request.biometricData, 'biometric.dat');
      formData.append('transactionId', transactionId);

      const biometricResponse = await axios.post(
        `${BIOMETRIC_SERVICE_URL}/api/biometric/verify`,
        formData,
        {
          headers: formData.getHeaders()
        }
      );

      if (!biometricResponse.data.success) {
        return {
          authorized: false,
          transactionId,
          error: 'Biometric verification failed'
        };
      }

      const { userId, matchScore } = biometricResponse.data.data;
      console.log(`✓ Biometric verified: User ${userId}, Score: ${matchScore}`);

      // Step 2: Get user token (for wallet access)
      // In production, use service-to-service authentication
      // For now, we'll call wallet service directly

      // Step 3: Check wallet balance
      console.log('Step 2: Checking wallet balance...');
      const walletResponse = await axios.get(
        `${WALLET_SERVICE_URL}/api/wallet/balance`,
        {
          headers: {
            'X-User-Id': userId, // Internal service header
            'X-Service': 'payment-auth'
          }
        }
      );

      const { balance, currency } = walletResponse.data.data;
      console.log(`✓ Wallet balance: ${balance} ${currency}`);

      // Step 4: Check sufficient balance
      if (balance < request.amount) {
        return {
          authorized: false,
          transactionId,
          userId,
          matchScore,
          walletBalance: balance,
          error: 'Insufficient balance'
        };
      }

      // Step 5: Debit wallet
      console.log('Step 3: Debiting wallet...');
      await axios.post(
        `${WALLET_SERVICE_URL}/api/wallet/payment`,
        {
          amount: request.amount,
          merchantId: request.merchantId,
          description: request.description || `Payment to ${request.merchantName}`
        },
        {
          headers: {
            'X-User-Id': userId,
            'X-Service': 'payment-auth'
          }
        }
      );

      console.log('✓ Payment authorized successfully');

      return {
        authorized: true,
        transactionId,
        userId,
        matchScore,
        walletBalance: balance - request.amount
      };
    } catch (error: any) {
      console.error('Payment authorization error:', error.response?.data || error.message);
      return {
        authorized: false,
        transactionId,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(transactionId: string): Promise<any> {
    // TODO: Query transaction status from database
    return {
      transactionId,
      status: 'pending'
    };
  }
}
