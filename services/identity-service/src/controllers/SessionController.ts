// Session Management Controller
// Task: 2.3 - Build session management with refresh tokens
// Requirements: 13.3, 13.4, 13.5

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { UserPermission } from '../models/UserPermission';
import { 
  generateTokenPair, 
  verifyAccessToken, 
  generateCorrelationId 
} from '../utils/security';
import { AuditLog, AuditActionType } from '../models/AuditLog';

export class SessionController {
  // Create new session
  async createSession(req: Request, res: Response) {
    try {
      const { userId, deviceInfo } = req.body;
      
      const userRepo = AppDataSource.getRepository(User);
      const sessionRepo = AppDataSource.getRepository(Session);
      const permissionRepo = AppDataSource.getRepository(UserPermission);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Get user
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user permissions
      const permissions = await permissionRepo.find({
        where: { userId: user.id },
        relations: ['permission']
      });
      const permissionCodes = permissions
        .filter(p => !p.isExpired())
        .map(p => p.permissionCode);

      // Generate tokens
      const sessionId = generateCorrelationId();
      const tokens = generateTokenPair(user, sessionId, permissionCodes);

      // Calculate expiry times
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours
      const refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create session
      const session = sessionRepo.create({
        id: sessionId,
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
        refreshTokenExpiresAt,
        deviceId: deviceInfo?.deviceId,
        deviceName: deviceInfo?.deviceName,
        deviceType: deviceInfo?.deviceType,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        lastActivityAt: now,
        isActive: true
      });

      await sessionRepo.save(session);

      // Audit log
      await auditRepo.save({
        timestamp: now,
        actorUserId: user.id,
        actorRole: user.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.SESSION_CREATED,
        resourceType: 'SESSION',
        resourceId: session.id,
        correlationId: generateCorrelationId(),
        entryHash: '', // Will be calculated by database trigger
        metadata: { deviceInfo }
      });

      res.status(201).json({
        sessionId: session.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const sessionRepo = AppDataSource.getRepository(Session);
      const userRepo = AppDataSource.getRepository(User);
      const permissionRepo = AppDataSource.getRepository(UserPermission);

      // Find session by refresh token
      const session = await sessionRepo.findOne({
        where: { refreshToken, isActive: true }
      });

      if (!session) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Check if refresh token is expired
      if (session.isRefreshTokenExpired()) {
        session.isActive = false;
        await sessionRepo.save(session);
        return res.status(401).json({ error: 'Refresh token expired' });
      }

      // Get user
      const user = await userRepo.findOne({ where: { id: session.userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user permissions
      const permissions = await permissionRepo.find({
        where: { userId: user.id },
        relations: ['permission']
      });
      const permissionCodes = permissions
        .filter(p => !p.isExpired())
        .map(p => p.permissionCode);

      // Generate new tokens
      const tokens = generateTokenPair(user, session.id, permissionCodes);

      // Update session
      const now = new Date();
      session.accessToken = tokens.accessToken;
      session.refreshToken = tokens.refreshToken;
      session.expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      session.refreshTokenExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      session.lastActivityAt = now;

      await sessionRepo.save(session);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }

  // Revoke session
  async revokeSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.userId; // From auth middleware

      const sessionRepo = AppDataSource.getRepository(Session);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const session = await sessionRepo.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Deactivate session
      session.isActive = false;
      await sessionRepo.save(session);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: userId,
        actorRole: req.user?.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.SESSION_REVOKED,
        resourceType: 'SESSION',
        resourceId: session.id,
        correlationId: generateCorrelationId(),
        entryHash: ''
      });

      res.json({ message: 'Session revoked successfully' });
    } catch (error) {
      console.error('Error revoking session:', error);
      res.status(500).json({ error: 'Failed to revoke session' });
    }
  }

  // Get user sessions
  async getUserSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const sessionRepo = AppDataSource.getRepository(Session);

      const sessions = await sessionRepo.find({
        where: { userId, isActive: true },
        order: { lastActivityAt: 'DESC' }
      });

      // Map sessions to safe response format
      const safeSessions = sessions.map(s => ({
        id: s.id,
        deviceName: s.deviceName,
        deviceType: s.deviceType,
        ipAddress: s.ipAddress,
        lastActivityAt: s.lastActivityAt,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.id === req.user?.sessionId
      }));

      res.json({ sessions: safeSessions });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  // Revoke all sessions except current
  async revokeAllSessions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const currentSessionId = req.user?.sessionId;

      const sessionRepo = AppDataSource.getRepository(Session);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Deactivate all sessions except current
      await sessionRepo
        .createQueryBuilder()
        .update(Session)
        .set({ isActive: false })
        .where('userId = :userId', { userId })
        .andWhere('id != :currentSessionId', { currentSessionId })
        .andWhere('isActive = true')
        .execute();

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: userId,
        actorRole: req.user?.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.SESSION_REVOKED,
        resourceType: 'SESSION',
        resourceId: 'ALL',
        correlationId: generateCorrelationId(),
        entryHash: '',
        metadata: { action: 'revoke_all_except_current' }
      });

      res.json({ message: 'All other sessions revoked successfully' });
    } catch (error) {
      console.error('Error revoking sessions:', error);
      res.status(500).json({ error: 'Failed to revoke sessions' });
    }
  }
}
