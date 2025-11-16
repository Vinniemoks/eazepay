import axios from 'axios';
import crypto from 'crypto';

export interface MpesaPaymentRequest {
  phoneNumber: string; // Format: 254XXXXXXXXX
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  transactionId: string;
  mpesaReceiptNumber?: string;
  amount: number;
  phoneNumber: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackUrl: string;
  private baseUrl: string;

  constructor(config: {
    consumerKey: string;
    consumerSecret: string;
    shortcode: string;
    passkey: string;
    callbackUrl: string;
    environment?: 'sandbox' | 'production';
  }) {
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.shortcode = config.shortcode;
    this.passkey = config.passkey;
    this.callbackUrl = config.callbackUrl;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    const response = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );

    return response.data.access_token;
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: request.phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.ResponseCode === '0',
        transactionId: response.data.CheckoutRequestID,
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        timestamp: new Date(),
        status: 'pending'
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId: crypto.randomUUID(),
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        timestamp: new Date(),
        status: 'failed'
      };
    }
  }

  /**
   * Query STK Push transaction status
   */
  async queryTransaction(checkoutRequestId: string): Promise<{
    success: boolean;
    status: 'pending' | 'completed' | 'failed';
    mpesaReceiptNumber?: string;
  }> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const resultCode = response.data.ResultCode;
      
      return {
        success: resultCode === '0',
        status: resultCode === '0' ? 'completed' : 
                resultCode === '1032' ? 'failed' : 'pending',
        mpesaReceiptNumber: response.data.MpesaReceiptNumber
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed'
      };
    }
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  private generateTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate password for M-Pesa API
   */
  private generatePassword(timestamp: string): string {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Kenyan phone number: 254XXXXXXXXX (12 digits)
    const regex = /^254[17]\d{8}$/;
    return regex.test(phoneNumber);
  }

  /**
   * Format phone number to M-Pesa format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove spaces, dashes, and plus sign
    let formatted = phoneNumber.replace(/[\s\-+]/g, '');
    
    // If starts with 0, replace with 254
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }
    
    // If doesn't start with 254, add it
    if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }
}
