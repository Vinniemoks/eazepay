import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api';
import { authStore } from '../store/authStore';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = authStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.client.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            authStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshToken() {
    const refreshToken = authStore.getState().refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', { refreshToken });
    authStore.getState().setToken(response.token, response.refreshToken);
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // HTTP Methods
  async get<T>(url: string, params?: any): Promise<T> {
    return this.client.get(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.client.put(url, data);
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    return this.client.patch(url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.client.delete(url);
  }

  // File upload
  async upload<T>(url: string, formData: FormData): Promise<T> {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
