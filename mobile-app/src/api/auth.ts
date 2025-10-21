import { apiClient } from '../config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: 'CUSTOMER' | 'AGENT';
  verificationType: 'PASSPORT' | 'NATIONAL_ID' | 'HUDUMA';
  verificationNumber: string;
  businessDetails?: any;
}

export interface Verify2FARequest {
  sessionToken: string;
  otp?: string;
  biometricData?: any;
}

export const authAPI = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  verify2FA: async (data: Verify2FARequest) => {
    const response = await apiClient.post('/api/auth/verify-2fa', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/api/auth/session/refresh', {
      refreshToken,
    });
    return response.data;
  },

  getSessions: async () => {
    const response = await apiClient.get('/api/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/api/auth/sessions/${sessionId}`);
    return response.data;
  },
};
