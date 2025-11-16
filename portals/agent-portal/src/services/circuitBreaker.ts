/**
 * Circuit Breaker Pattern Implementation
 * Isolates failing services to prevent cascade failures
 */

enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Service failing, reject requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
      resetTimeout: config.resetTimeout || 30000 // 30 seconds
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN - Service temporarily unavailable');
      }
      // Try to recover
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await Promise.race([
        fn(),
        this.timeout()
      ]);

      this.onSuccess();
      return result as T;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private timeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);
    });
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        console.log('Circuit breaker CLOSED - Service recovered');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.resetTimeout;
      console.error('Circuit breaker OPEN - Service isolated');
      
      // Notify monitoring
      this.notifyFailure();
    }
  }

  private notifyFailure(): void {
    // Send alert to monitoring system
    console.error('Service failure detected - Circuit breaker activated');
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking (e.g., Sentry)
      // Send notification to ops team
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
  }
}

// Create circuit breakers for each service
export const biometricServiceBreaker = new CircuitBreaker({
  failureThreshold: 3,
  timeout: 30000 // 30 seconds for biometric operations
});

export const identityServiceBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 10000
});

export const walletServiceBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 10000
});

export const mpesaServiceBreaker = new CircuitBreaker({
  failureThreshold: 3,
  timeout: 60000 // 1 minute for M-Pesa
});

export default CircuitBreaker;
