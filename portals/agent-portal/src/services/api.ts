import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.eazepay.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Add request ID for tracing
  config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return config;
});

// Handle errors with circuit breaker awareness
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('agentName');
      window.location.href = '/login';
    }
    
    // Log error for monitoring
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Check if circuit breaker is open
    if (error.message?.includes('Circuit breaker is OPEN')) {
      // Show user-friendly message
      alert('Service temporarily unavailable. Please try again in a moment.');
    }
    
    return Promise.reject(error);
  }
);

export interface RegisterCustomerRequest {
  phoneNumber: string;
  fullName: string;
  nationalId: string;
  email?: string;
  biometricData: Array<{
    type: 'fingerprint' | 'palm';
    fingerType?: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
    hand: 'left' | 'right';
    data: string;
  }>;
  primaryFingerIndex: number;
}

export interface RegisterCustomerResponse {
  success: boolean;
  userId: string;
  walletId: string;
  templatesEnrolled: number;
  message: string;
  nextSteps: string[];
}

export const registerCustomer = async (
  data: RegisterCustomerRequest
): Promise<RegisterCustomerResponse> => {
  // Use circuit breaker for resilience
  const { biometricServiceBreaker } = await import('./circuitBreaker');
  
  return biometricServiceBreaker.execute(async () => {
    const response = await api.post('/api/agent/register-customer', data);
    return response.data;
  });
};

export const verifyCustomer = async (biometricData: string) => {
  const response = await api.post('/api/agent/verify-customer', {
    biometricData
  });
  return response.data;
};

export const processCashIn = async (
  biometricData: string,
  amount: number,
  currency: string
) => {
  const response = await api.post('/api/agent/cash-in', {
    biometricData,
    amount,
    currency
  });
  return response.data;
};

export const processCashOut = async (
  biometricData: string,
  amount: number,
  currency: string
) => {
  const response = await api.post('/api/agent/cash-out', {
    biometricData,
    amount,
    currency
  });
  return response.data;
};

export const getAgentStats = async () => {
  const response = await api.get('/api/agent/stats');
  return response.data;
};

export const login = async (phoneNumber: string, password: string) => {
  const response = await api.post('/api/auth/login', {
    phoneNumber,
    password
  });
  return response.data;
};

export default api;
