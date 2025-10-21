import { create } from 'zustand';
import { walletAPI } from '../api/wallet';

interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'REQUEST';
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  recipientPhone?: string;
  senderPhone?: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number) => Promise<void>;
  sendMoney: (recipientPhone: string, amount: number, description: string, pin: string) => Promise<void>;
  requestMoney: (fromPhone: string, amount: number, description?: string) => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletAPI.getBalance();
      set({ balance: response.balance, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch balance',
        isLoading: false,
      });
    }
  },

  fetchTransactions: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletAPI.getTransactions(page);
      set({
        transactions: page === 1 ? response.transactions : [...get().transactions, ...response.transactions],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  sendMoney: async (recipientPhone: string, amount: number, description: string, pin: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletAPI.sendMoney({ recipientPhone, amount, description, pin });
      await get().fetchBalance();
      await get().fetchTransactions();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send money',
        isLoading: false,
      });
      throw error;
    }
  },

  requestMoney: async (fromPhone: string, amount: number, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      await walletAPI.requestMoney(fromPhone, amount, description);
      await get().fetchTransactions();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to request money',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
