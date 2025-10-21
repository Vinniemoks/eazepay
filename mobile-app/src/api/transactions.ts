import { apiClient } from './client';

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

export interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  type?: Transaction['type'];
  status?: Transaction['status'];
  startDate?: string;
  endDate?: string;
}

export interface TransactionHistoryResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

class TransactionApi {
  async sendMoney(data: SendMoneyRequest): Promise<SendMoneyResponse> {
    return apiClient.post('/transactions/send', data);
  }

  async getHistory(params?: TransactionHistoryParams): Promise<TransactionHistoryResponse> {
    return apiClient.get('/transactions/history', params);
  }

  async getTransactionById(id: string): Promise<Transaction> {
    return apiClient.get(`/transactions/${id}`);
  }

  async requestMoney(recipientPhone: string, amount: number, reason?: string) {
    return apiClient.post('/transactions/request', {
      recipientPhone,
      amount,
      reason,
    });
  }

  async generateQRCode(amount?: number): Promise<{ qrCode: string }> {
    return apiClient.post('/transactions/qr-code', { amount });
  }
}

export const transactionApi = new TransactionApi();
