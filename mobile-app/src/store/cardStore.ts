import { create } from 'zustand';
import api, { endpoints } from '../config/api';

interface VirtualCard {
  cardId: string;
  cardType: 'mastercard' | 'visa';
  cardholderName: string;
  lastFourDigits: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'cancelled';
  expiryMonth: number;
  expiryYear: number;
  createdAt: string;
}

interface CardTransaction {
  id: string;
  merchantName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface CardState {
  cards: VirtualCard[];
  selectedCard: VirtualCard | null;
  cardTransactions: CardTransaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCards: () => Promise<void>;
  createCard: (data: CreateCardData) => Promise<void>;
  selectCard: (cardId: string) => void;
  fetchCardTransactions: (cardId: string) => Promise<void>;
  topUpCard: (cardId: string, amount: number, sourceCurrency: string) => Promise<void>;
  freezeCard: (cardId: string) => Promise<void>;
  unfreezeCard: (cardId: string) => Promise<void>;
  clearError: () => void;
}

interface CreateCardData {
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  cardType?: 'mastercard' | 'visa';
  currency?: string;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  selectedCard: null,
  cardTransactions: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(endpoints.listCards);
      const { cards } = response.data.data;

      set({
        cards,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch cards',
        isLoading: false,
      });
    }
  },

  createCard: async (data: CreateCardData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(endpoints.createCard, data);
      
      // Refresh cards list
      await get().fetchCards();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create card',
        isLoading: false,
      });
      throw error;
    }
  },

  selectCard: (cardId: string) => {
    const card = get().cards.find(c => c.cardId === cardId);
    set({ selectedCard: card || null });
  },

  fetchCardTransactions: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(endpoints.getCardTransactions(cardId));
      const { transactions } = response.data.data;

      set({
        cardTransactions: transactions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  topUpCard: async (cardId: string, amount: number, sourceCurrency: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(endpoints.topUpCard(cardId), {
        amount,
        sourceCurrency,
        paymentMethod: 'wallet',
      });
      
      // Refresh cards
      await get().fetchCards();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to top up card',
        isLoading: false,
      });
      throw error;
    }
  },

  freezeCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(endpoints.freezeCard(cardId));
      await get().fetchCards();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to freeze card',
        isLoading: false,
      });
      throw error;
    }
  },

  unfreezeCard: async (cardId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(endpoints.unfreezeCard(cardId));
      await get().fetchCards();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to unfreeze card',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
