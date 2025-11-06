import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Redis key prefix
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export class RateLimiter {
  private redis: Redis;
  private config: Required<RateLimitConfig>;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: 'ratelimit',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later',
      ...config
    };
  }

  /**
   * Create rate limit middleware
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.getKey(req);
        const current = await this.increment(key);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - current));
        res.setHeader('X-RateLimit-Reset', Date.now() + this.config.windowMs);

        if (current > this.config.maxRequests) {
          res.status(429).json({
            success: false,
            error: this.config.message,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(this.config.windowMs / 1000)
          });
          return;
        }

        next();
      } catch (error) {
        // If Redis fails, allow request (fail open)
        console.error('Rate limiter error:', error);
        next();
      }
    };
  }

  /**
   * Increment request count
   */
  private async increment(key: string): Promise<number> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.pexpire(key, this.config.windowMs);
    const results = await multi.exec();
    
    if (!results || !results[0] || !results[0][1]) {
      return 0;
    }
    
    return results[0][1] as number;
  }

  /**
   * Get rate limit key for request
   */
  private getKey(req: Request): string {
    const identifier = this.getIdentifier(req);
    const route = req.route?.path || req.path;
    return `${this.config.keyPrefix}:${route}:${identifier}`;
  }

  /**
   * Get identifier for rate limiting (IP or user ID)
   */
  private getIdentifier(req: Request): string {
    // Use user ID if authenticated
    const user = (req as any).user;
    if (user?.userId) {
      return `user:${user.userId}`;
    }

    // Otherwise use IP address
    const ip = req.ip || 
               req.headers['x-forwarded-for'] as string || 
               req.headers['x-real-ip'] as string ||
               req.socket.remoteAddress ||
               'unknown';
    
    return `ip:${ip}`;
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async reset(identifier: string, route?: string): Promise<void> {
    const pattern = route 
      ? `${this.config.keyPrefix}:${route}:${identifier}`
      : `${this.config.keyPrefix}:*:${identifier}`;
    
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Get current count for identifier
   */
  async getCount(identifier: string, route: string): Promise<number> {
    const key = `${this.config.keyPrefix}:${route}:${identifier}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }
}

/**
 * Create rate limiter for authentication endpoints
 */
export function createAuthRateLimiter(redis: Redis): RateLimiter {
  return new RateLimiter(redis, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'auth-limit',
    message: 'Too many authentication attempts, please try again later'
  });
}

/**
 * Create rate limiter for password reset
 */
export function createPasswordResetLimiter(redis: Redis): RateLimiter {
  return new RateLimiter(redis, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    keyPrefix: 'password-reset-limit',
    message: 'Too many password reset attempts, please try again later'
  });
}

/**
 * Create rate limiter for 2FA attempts
 */
export function create2FALimiter(redis: Redis): RateLimiter {
  return new RateLimiter(redis, {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5,
    keyPrefix: '2fa-limit',
    message: 'Too many 2FA attempts, please try again later'
  });
}

/**
 * Create rate limiter for general API endpoints
 */
export function createAPIRateLimiter(redis: Redis): RateLimiter {
  return new RateLimiter(redis, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'api-limit',
    message: 'Too many requests, please slow down'
  });
}
