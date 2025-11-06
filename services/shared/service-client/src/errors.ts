export class ServiceCommunicationError extends Error {
  constructor(
    message: string,
    public serviceName: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ServiceCommunicationError';
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(public serviceName: string) {
    super(`Circuit breaker is open for service: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class ServiceTimeoutError extends Error {
  constructor(public serviceName: string, public timeout: number) {
    super(`Service ${serviceName} timed out after ${timeout}ms`);
    this.name = 'ServiceTimeoutError';
  }
}
