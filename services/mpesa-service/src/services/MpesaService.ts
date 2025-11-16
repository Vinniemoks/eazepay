import axios from 'axios';
import crypto from 'crypto';

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackUrl: string;
  private baseUrl: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || '';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || '';
    
    const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.baseUrl = environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      console.error('M-Pesa auth error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  async initiateSTKPush(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: this.formatPhoneNumber(request.phoneNumber),
      PartyB: this.shortcode,
      PhoneNumber: this.formatPhoneNumber(request.phoneNumber),
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
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error: any) {
      console.error('STK Push error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async queryTransaction(checkoutRequestId: string): Promise<any> {
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

      return {
        success: response.data.ResultCode === '0',
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        mpesaReceiptNumber: response.data.MpesaReceiptNumber
      };
    } catch (error: any) {
      console.error('Query error:', error.response?.data || error.message);
      throw new Error('Failed to query M-Pesa transaction');
    }
  }

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

  private generatePassword(timestamp: string): string {
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/[\s\-+]/g, '');
    
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }
    
    if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    
    return formatted;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    const regex = /^254[17]\d{8}$/;
    return regex.test(formatted);
  }
}
