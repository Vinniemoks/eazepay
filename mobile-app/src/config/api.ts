import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost' // Development
  : 'https://api.eazepay.com'; // Production

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data.tokens;
          await AsyncStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // Navigate to login screen (handled by navigation)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Endpoints
export const endpoints = {
  // Auth
  register: '/api/auth/register',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  profile: '/api/auth/profile',
  
  // Wallet
  createWallet: '/api/wallet/create',
  getBalance: '/api/wallet/balance',
  getTransactions: '/api/wallet/transactions',
  
  // M-Pesa
  initiateMpesa: '/api/mpesa/initiate',
  queryMpesa: (id: string) => `/api/mpesa/query/${id}`,
  
  // Biometric
  enrollBiometric: '/api/biometric/enroll',
  verifyBiometric: '/api/biometric/verify',
  getTemplates: '/api/biometric/templates',
  
  // Virtual Cards
  createCard: '/api/cards/create',
  listCards: '/api/cards/list',
  getCard: (id: string) => `/api/cards/${id}`,
  getCardBalance: (id: string) => `/api/cards/${id}/balance`,
  topUpCard: (id: string) => `/api/cards/${id}/topup`,
  getCardTransactions: (id: string) => `/api/cards/${id}/transactions`,
  freezeCard: (id: string) => `/api/cards/${id}/freeze`,
  unfreezeCard: (id: string) => `/api/cards/${id}/unfreeze`,
  
  // Payment
  authorizePayment: '/api/payment/authorize',
};
