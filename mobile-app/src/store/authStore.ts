import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';

interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  verify2FA: (otp?: string, biometricData?: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.requires2FA) {
        set({
          sessionToken: response.sessionToken,
          isLoading: false,
        });
      } else {
        await AsyncStorage.multiSet([
          ['access_token', response.accessToken],
          ['refresh_token', response.refreshToken],
          ['user', JSON.stringify(response.user)],
        ]);

        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  verify2FA: async (otp?: string, biometricData?: any) => {
    const { sessionToken } = get();
    if (!sessionToken) {
      throw new Error('No session token');
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.verify2FA({
        sessionToken,
        otp,
        biometricData,
      });

      await AsyncStorage.multiSet([
        ['access_token', response.accessToken],
        ['refresh_token', response.refreshToken],
        ['user', JSON.stringify(response.user)],
      ]);

      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        sessionToken: null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '2FA verification failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionToken: null,
      isAuthenticated: false,
    });
  },

  loadUser: async () => {
    try {
      const [[, accessToken], [, refreshToken], [, userData]] =
        await AsyncStorage.multiGet(['access_token', 'refresh_token', 'user']);

      if (accessToken && userData) {
        set({
          user: JSON.parse(userData),
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
