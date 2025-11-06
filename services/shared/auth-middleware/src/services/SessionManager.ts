import Redis from 'ioredis';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    deviceType: string;
  };
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private redis: Redis;
  private sessionTTL: number;

  constructor(redisUrlOrClient: string | Redis, sessionTTL: number = 28800) { // 8 hours default
    if (typeof redisUrlOrClient === 'string') {
      this.redis = new Redis(redisUrlOrClient);
    } else {
      this.redis = redisUrlOrClient;
    }
    this.sessionTTL = sessionTTL;
  }

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    userId: string,
    email: string,
    role: string,
    deviceInfo: { userAgent: string; ip: string; deviceType: string }
  ): Promise<void> {
    const sessionData: SessionData = {
      userId,
      email,
      role,
      deviceInfo,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTTL * 1000)
    };

    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTTL,
      JSON.stringify(sessionData)
    );

    // Track user sessions for multi-device management
    await this.redis.sadd(`user:${userId}:sessions`, sessionId);
  }

  /**
   * Validate session exists and is active
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.redis.get(`session:${sessionId}`);
    return session !== null;
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = await this.redis.get(`session:${sessionId}`);
    if (!session) return null;

    return JSON.parse(session);
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    session.lastActivityAt = new Date();
    await this.redis.setex(
      `session:${sessionId}`,
      this.sessionTTL,
      JSON.stringify(session)
    );
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.redis.srem(`user:${session.userId}:sessions`, sessionId);
    }
    await this.redis.del(`session:${sessionId}`);
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);
    
    const pipeline = this.redis.pipeline();
    sessionIds.forEach((sessionId: string) => {
      pipeline.del(`session:${sessionId}`);
    });
    pipeline.del(`user:${userId}:sessions`);
    
    await pipeline.exec();
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.redis.smembers(`user:${userId}:sessions`);
    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  /**
   * Blacklist a token (for logout)
   */
  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    await this.redis.setex(`blacklist:${token}`, expiresIn, '1');
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${token}`);
    return result !== null;
  }

  /**
   * Store OTP for 2FA
   */
  async storeOTP(userId: string, otp: string, ttl: number = 600): Promise<void> {
    await this.redis.setex(`otp:${userId}`, ttl, otp);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const storedOTP = await this.redis.get(`otp:${userId}`);
    if (storedOTP === otp) {
      // Delete OTP after successful verification
      await this.redis.del(`otp:${userId}`);
      return true;
    }
    return false;
  }

  /**
   * Store password reset token
   */
  async storeResetToken(userId: string, tokenHash: string, ttl: number = 3600): Promise<void> {
    await this.redis.setex(`reset:${userId}`, ttl, tokenHash);
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(userId: string, tokenHash: string): Promise<boolean> {
    const storedHash = await this.redis.get(`reset:${userId}`);
    if (storedHash === tokenHash) {
      await this.redis.del(`reset:${userId}`);
      return true;
    }
    return false;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
