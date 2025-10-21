import { apiClient } from '../config/api';

export interface SendMoneyRequest {
  recipientPhone: string;
  amount: number;
  description?: string;
  pin: string;
}

export const walletAPI = {
  getBalance: async () => {
    const response = await apiClient.get('/api/wallet/balance');
    return response.data;
  },

  sendMoney: async (data: SendMoneyRequest) => {
    const response = await apiClient.post('/api/wallet/send', data);
    return response.data;
  },

  requestMoney: async (fromPhone: string, amount: number, description?: string) => {
    const response = await apiClient.post('/api/wallet/request', {
      fromPhone,
      amount,
      description,
    });
    return response.data;
  },

  getTransactions: async (page = 1, limit = 20) => {
    const response = await apiClient.get('/api/wallet/transactions', {
      params: { page, limit },
    });
    return response.data;
  },

  getTransaction: async (transactionId: string) => {
    const response = await apiClient.get(`/api/wallet/transactions/${transactionId}`);
    return response.data;
  },
};
