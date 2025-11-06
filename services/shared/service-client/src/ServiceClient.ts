import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import { ServiceClientConfig, CircuitBreakerConfig, RetryConfig } from './types';
import { ServiceCommunicationError, CircuitBreakerOpenError, ServiceTimeoutError } from './errors';

export class ServiceClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker?: CircuitBreaker;
  private config: ServiceClientConfig;

  constructor(config: ServiceClientConfig) {
    this.config = {
      timeout: 30000,
      circuitBreaker: {
        timeout: 30000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
        enabled: true,
        ...config.circuitBreaker
      },
      retry: {
        retries: 3,
        retryDelay: 1000,
        enabled: true,
        ...config.retry
      },
      ...config
    };

    this.axiosInstance = this.createAxiosInstance();
    
    if (this.config.circuitBreaker?.enabled) {
      this.circuitBreaker = this.createCircuitBreaker();
    }
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': this.config.serviceName,
        ...this.config.headers
      }
    });

    // Add retry logic
    if (this.config.retry?.enabled) {
      axiosRetry(instance, {
        retries: this.config.retry.retries || 3,
        retryDelay: (retryCount) => {
          return retryCount * (this.config.retry?.retryDelay || 1000);
        },
        retryCondition: this.config.retry.retryCondition || ((error) => {
          return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                 (error.response?.status ? error.response.status >= 500 : false);
        })
      });
    }

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Request-Timestamp'] = new Date().toISOString();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new ServiceTimeoutError(this.config.serviceName, this.config.timeout!);
        }
        throw new ServiceCommunicationError(
          error.message,
          this.config.serviceName,
          error.response?.status,
          error
        );
      }
    );

    return instance;
  }

  private createCircuitBreaker(): CircuitBreaker {
    const options = {
      timeout: this.config.circuitBreaker!.timeout || 30000,
      errorThresholdPercentage: this.config.circuitBreaker!.errorThresholdPercentage || 50,
      resetTimeout: this.config.circuitBreaker!.resetTimeout || 30000,
      rollingCountTimeout: this.config.circuitBreaker!.rollingCountTimeout || 10000,
      rollingCountBuckets: this.config.circuitBreaker!.rollingCountBuckets || 10,
      name: this.config.circuitBreaker!.name || this.config.serviceName
    };

    const breaker = new CircuitBreaker(
      async (requestFn: () => Promise<any>) => requestFn(),
      options
    );

    breaker.on('open', () => {
      console.warn(`Circuit breaker opened for ${this.config.serviceName}`);
    });

    breaker.on('halfOpen', () => {
      console.info(`Circuit breaker half-open for ${this.config.serviceName}`);
    });

    breaker.on('close', () => {
      console.info(`Circuit breaker closed for ${this.config.serviceName}`);
    });

    return breaker;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async executeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
    try {
      if (this.circuitBreaker) {
        const response = await this.circuitBreaker.fire(requestFn);
        return response.data;
      } else {
        const response = await requestFn();
        return response.data;
      }
    } catch (error: any) {
      if (error.name === 'OpenCircuitError') {
        throw new CircuitBreakerOpenError(this.config.serviceName);
      }
      throw error;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRequest(() => this.axiosInstance.get<T>(url, config));
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRequest(() => this.axiosInstance.post<T>(url, data, config));
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRequest(() => this.axiosInstance.put<T>(url, data, config));
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRequest(() => this.axiosInstance.patch<T>(url, data, config));
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeRequest(() => this.axiosInstance.delete<T>(url, config));
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  getStats() {
    if (this.circuitBreaker) {
      return {
        state: this.circuitBreaker.opened ? 'open' : this.circuitBreaker.halfOpen ? 'half-open' : 'closed',
        stats: this.circuitBreaker.stats
      };
    }
    return null;
  }
}
