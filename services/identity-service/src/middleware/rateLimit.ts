// Rate limiting middleware
// Task: 11.5 - Add rate limiting
// Requirements: 15.5

import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import Redis from 'ioredis';

// Temporarily disable Redis store for rate limiting to avoid compatibility issues
// const redis = new Redis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT || '6379'),
//   password: process.env.REDIS_PASSWORD,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

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
  // Using memory store for now - in production, use Redis store
  // store: new RedisStore({
  //   // @ts-ignore
  //   client: redis,
  //   prefix: 'rl:api:'
  // }),
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
  // store: new RedisStore({
  //   // @ts-ignore
  //   client: redis,
  //   prefix: 'rl:auth:'
  // }),
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
  // store: new RedisStore({
  //   // @ts-ignore
  //   client: redis,
  //   prefix: 'rl:org:'
  // }),
  keyGenerator: (req) => {
    // Extract organization from user or use IP
    return req.user?.organizationId || req.ip || 'anonymous';
  },
  skip: (req) => {
    // Skip for superusers
    return req.user?.role === 'SUPERUSER';
  }
});
