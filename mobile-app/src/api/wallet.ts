import { apiClient } from './client';

export interface WalletBalance {
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN';
  dailyLimit: number;
  monthlyLimit: number;
  availableLimit: number;
}

export interface SendMoneyRequest {
  recipientPhone: string;
  amount: number;
  description?: string;
  pin?: string;
}

export interface SendMoneyResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  fee: number;
  total: number;
  newBalance: number;
}

export interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  fee: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  fromUserId: string;
  toUserId: string;
  fromName?: string;
  toName?: string;
  description: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionHistoryResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

class WalletApi {
  async getBalance(): Promise<WalletBalance> {
    return apiClient.get('/wallet/balance');
  }

  async sendMoney(data: SendMoneyRequest): Promise<SendMoneyResponse> {
    return apiClient.post('/wallet/send', data);
  }

  async requestMoney(
    fromPhone: string,
    amount: number,
    description?: string
  ): Promise<{ success: boolean; requestId: string }> {
    return apiClient.post('/wallet/request', {
      fromPhone,
      amount,
      description,
    });
  }

  async getTransactions(page = 1, limit = 20): Promise<TransactionHistoryResponse> {
    return apiClient.get('/wallet/transactions', { page, limit });
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    return apiClient.get(`/wallet/transactions/${transactionId}`);
  }

  async generateQRCode(amount?: number): Promise<{ qrCode: string; qrData: string }> {
    return apiClient.post('/wallet/qr-code', { amount });
  }
}

export const walletApi = new WalletApi();

// Legacy export for backward compatibility
export const walletAPI = walletApi;
