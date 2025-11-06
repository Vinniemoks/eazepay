export interface CircuitBreakerConfig {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
  enabled?: boolean;
}

export interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  enabled?: boolean;
}

export interface ServiceClientConfig {
  serviceName: string;
  baseURL: string;
  timeout?: number;
  circuitBreaker?: CircuitBreakerConfig;
  retry?: RetryConfig;
  headers?: Record<string, string>;
}

export interface ServiceEndpoint {
  name: string;
  url: string;
  healthCheck?: string;
}
