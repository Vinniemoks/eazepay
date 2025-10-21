import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  requires2FA?: boolean;
  sessionToken?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
  message: string;
}

export interface VerifyOTPRequest {
  userId: string;
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface ResendOTPRequest {
  userId: string;
  phone: string;
}

export interface KYCUploadRequest {
  userId: string;
  documentType: 'PASSPORT' | 'NATIONAL_ID' | 'HUDUMA';
  documentNumber: string;
  documentFront: string; // base64 or file path
  documentBack?: string;
  selfie: string;
}

export interface Verify2FARequest {
  sessionToken: string;
  otp?: string;
  biometricData?: any;
}

class AuthApi {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post('/auth/register', data);
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return apiClient.post('/auth/verify-otp', data);
  }

  async resendOTP(data: ResendOTPRequest): Promise<{ success: boolean }> {
    return apiClient.post('/auth/resend-otp', data);
  }

  async uploadKYC(data: KYCUploadRequest): Promise<{ success: boolean }> {
    return apiClient.post('/auth/kyc/upload', data);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', data);
  }

  async verify2FA(data: Verify2FARequest): Promise<LoginResponse> {
    return apiClient.post('/auth/verify-2fa', data);
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    return apiClient.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<{ success: boolean }> {
    return apiClient.post('/auth/logout');
  }

  async getSessions() {
    return apiClient.get('/auth/sessions');
  }

  async revokeSession(sessionId: string) {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export const authApi = new AuthApi();

// Legacy export for backward compatibility
export const authAPI = authApi;
