import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { endpoints } from '../config/api';
import { biometricService } from '../services/biometric';

interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  role: string;
  biometricEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  
  // Actions
  login: (phoneNumber: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  checkBiometricAvailability: () => Promise<void>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
}

interface RegisterData {
  phoneNumber: string;
  fullName: string;
  email?: string;
  password: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricAvailable: false,
  biometricEnabled: false,

  checkBiometricAvailability: async () => {
    const { available } = await biometricService.isAvailable();
    const enabled = await biometricService.isBiometricLoginEnabled();
    set({ biometricAvailable: available, biometricEnabled: enabled });
  },

  enableBiometric: async () => {
    const { user } = get();
    if (!user) return false;

    const success = await biometricService.enableBiometricLogin(user.id);
    if (success) {
      set({ biometricEnabled: true });
    }
    return success;
  },

  disableBiometric: async () => {
    const success = await biometricService.disableBiometricLogin();
    if (success) {
      set({ biometricEnabled: false });
    }
    return success;
  },

  loginWithBiometric: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await biometricService.loginWithBiometric();
      
      if (!result.success || !result.token) {
        throw new Error('Biometric authentication failed');
      }

      // Save token
      await AsyncStorage.setItem('accessToken', result.token);

      // Load user data
      const response = await api.get('/user/me');
      const user = response.data.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        biometricEnabled: true,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Biometric login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (phoneNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(endpoints.login, {
        phoneNumber,
        password,
      });

      const { user, tokens } = response.data.data;

      // Save tokens
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(endpoints.register, data);

      const { user, tokens } = response.data.data;

      // Save tokens
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(endpoints.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        const biometricEnabled = await biometricService.isBiometricLoginEnabled();
        
        set({
          user,
          isAuthenticated: true,
          biometricEnabled,
        });
      }

      // Check biometric availability
      const { available } = await biometricService.isAvailable();
      set({ biometricAvailable: available });
    } catch (error) {
      console.error('Load user error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
