import { create } from 'zustand';
import api, { endpoints } from '../config/api';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

interface WalletState {
  balance: number;
  currency: string;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  topUpWithMpesa: (phoneNumber: string, amount: number) => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  currency: 'KES',
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(endpoints.getBalance);
      const { balance, currency } = response.data.data;

      set({
        balance,
        currency,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch balance',
        isLoading: false,
      });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(endpoints.getTransactions);
      const { transactions } = response.data.data;

      set({
        transactions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  topUpWithMpesa: async (phoneNumber: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(endpoints.initiateMpesa, {
        phoneNumber,
        amount,
        accountReference: 'WALLET_TOPUP',
        transactionDesc: 'Wallet Top-up',
      });

      // Poll for transaction status
      const { checkoutRequestId } = response.data.data;
      
      // Wait a bit for user to complete M-Pesa
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Refresh balance
      await get().fetchBalance();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'M-Pesa top-up failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
