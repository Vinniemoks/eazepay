// Rate limiting middleware
// Task: 11.5 - Add rate limiting
// Requirements: 15.5

import rateLimit, { Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import dotenv from 'dotenv';

// Ensure environment variables are loaded even if importer loads before index.ts
dotenv.config();

const useMemoryStore = (process.env.USE_MEMORY_RATE_LIMIT === 'true') || ((process.env.SKIP_DB_INIT || 'false').toLowerCase() === 'true');

const redis: Redis | undefined = useMemoryStore ? undefined : new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

const buildStore = (prefix: string): Store | undefined => {
  if (useMemoryStore) return undefined; // default MemoryStore
  if (!redis) return undefined; // Should not happen if useMemoryStore is false, but for type safety

  return new RedisStore({
    client: redis,
    prefix,
  });
};

// General API rate limit: 100 requests per minute per user
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Rate limit exceeded',
    code: 'SYS_001',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis store when available; otherwise default MemoryStore
  store: buildStore('rl:api:'),
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP address
    return req.user?.userId || req.ip || 'anonymous';
  }
});

// Strict rate limit for authentication endpoints: 5 requests per minute
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: 'Rate limit exceeded',
    code: 'SYS_001',
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore('rl:auth:'),
  keyGenerator: (req) => {
    return req.body?.email || req.ip || 'anonymous';
  }
});

// Organization-level rate limit: 1000 requests per minute
export const orgRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: {
    error: 'Organization rate limit exceeded',
    code: 'SYS_001',
    message: 'Organization has exceeded rate limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: buildStore('rl:org:'),
  keyGenerator: (req) => {
    // Extract organization from user or use IP
    return req.user?.organizationId || req.ip || 'anonymous';
  },
  skip: (req) => {
    // Skip for superusers
    return req.user?.role === 'SUPERUSER';
  }
});
