import { AppDataSource } from '../config/database';
import { Session } from '../models/Session';
import Redis from 'ioredis';

export class SessionManager {
  private redis: Redis;
  private sessionTtlSeconds: number;

  constructor(redisClient: Redis, sessionTtlSeconds: number = 8 * 60 * 60) {
    this.redis = redisClient;
    this.sessionTtlSeconds = sessionTtlSeconds;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOne({ where: { id: sessionId, isActive: true } });
    return !!session && !session.isExpired();
  }

  async blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
    const key = `bl:${token}`;
    await this.redis.set(key, '1', 'EX', Math.max(1, expiresInSeconds));
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOne({ where: { id: sessionId } });
    if (session) {
      session.isActive = false;
      await repo.save(session);
    }
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    const repo = AppDataSource.getRepository(Session);
    const sessions = await repo.find({ where: { userId, isActive: true } });
    if (sessions.length) {
      for (const s of sessions) s.isActive = false;
      await repo.save(sessions);
    }
  }

  async getUserSessions(userId: string): Promise<Array<{ deviceInfo: string; createdAt: Date; lastActivityAt: Date | null; expiresAt: Date }>> {
    const repo = AppDataSource.getRepository(Session);
    const sessions = await repo.find({ where: { userId, isActive: true } });
    return sessions.map(s => ({
      deviceInfo: `${s.deviceType || 'unknown'} | ${s.deviceName || 'unknown'} | ${s.ipAddress || 'unknown'}`,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt || null,
      expiresAt: s.expiresAt
    }));
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const repo = AppDataSource.getRepository(Session);
    const session = await repo.findOne({ where: { id: sessionId } });
    return session || null;
  }

  async storeResetToken(userId: string, resetTokenHash: string, ttlSeconds: number): Promise<void> {
    const key = `rt:${userId}`;
    await this.redis.set(key, resetTokenHash, 'EX', Math.max(1, ttlSeconds));
  }

  async verifyResetToken(userId: string, rawToken: string): Promise<boolean> {
    const key = `rt:${userId}`;
    const storedHash = await this.redis.get(key);
    if (!storedHash) return false;
    const bcrypt = require('bcrypt');
    return bcrypt.compare(rawToken, storedHash);
  }

  async storeOTP(userId: string, otp: string, ttlSeconds: number): Promise<void> {
    const key = `otp:${userId}`;
    await this.redis.set(key, otp, 'EX', Math.max(1, ttlSeconds));
  }

  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const key = `otp:${userId}`;
    const stored = await this.redis.get(key);
    return !!stored && stored === otp;
  }

  async createSession(
    sessionId: string,
    userId: string,
    email: string,
    role: string,
    meta: { userAgent?: string; ip?: string; deviceType?: string; deviceId?: string; deviceName?: string },
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    const repo = AppDataSource.getRepository(Session);
    const now = new Date();
    const session = repo.create({
      id: sessionId,
      userId,
      accessToken,
      refreshToken,
      expiresAt: new Date(now.getTime() + this.sessionTtlSeconds * 1000),
      refreshTokenExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: meta.ip || null,
      userAgent: meta.userAgent || null,
      deviceType: meta.deviceType || null,
      deviceId: meta.deviceId || null,
      deviceName: meta.deviceName || null,
      lastActivityAt: now,
      isActive: true
    });
    await repo.save(session);
  }
}

export default SessionManager;