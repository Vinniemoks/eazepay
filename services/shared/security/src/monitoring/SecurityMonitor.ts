import { EventEmitter } from 'events';
import Redis from 'ioredis';

export interface SecurityAlert {
  alertType: 'brute_force' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SecurityMonitorConfig {
  redis: Redis;
  bruteForceThreshold?: number;
  bruteForceWindow?: number; // seconds
  suspiciousActivityThreshold?: number;
  alertWebhook?: string;
  enableAutoBlock?: boolean;
}

export class SecurityMonitor extends EventEmitter {
  private redis: Redis;
  private config: Required<SecurityMonitorConfig>;

  constructor(config: SecurityMonitorConfig) {
    super();
    this.redis = config.redis;
    this.config = {
      redis: config.redis,
      bruteForceThreshold: config.bruteForceThreshold || 5,
      bruteForceWindow: config.bruteForceWindow || 300, // 5 minutes
      suspiciousActivityThreshold: config.suspiciousActivityThreshold || 10,
      alertWebhook: config.alertWebhook || '',
      enableAutoBlock: config.enableAutoBlock !== false
    };
  }

  /**
   * Track failed login attempt
   */
  async trackFailedLogin(identifier: string, ipAddress: string): Promise<void> {
    const key = `security:failed_login:${identifier}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, this.config.bruteForceWindow);
    }

    if (count >= this.config.bruteForceThreshold) {
      await this.raiseAlert({
        alertType: 'brute_force',
        severity: 'high',
        userId: identifier,
        ipAddress,
        description: `Brute force attack detected: ${count} failed login attempts`,
        metadata: { attempts: count },
        timestamp: new Date()
      });

      if (this.config.enableAutoBlock) {
        await this.blockIdentifier(identifier, 3600); // Block for 1 hour
      }
    }
  }

  /**
   * Track suspicious activity
   */
  async trackSuspiciousActivity(
    userId: string,
    activityType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const key = `security:suspicious:${userId}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 3600); // 1 hour window
    }

    if (count >= this.config.suspiciousActivityThreshold) {
      await this.raiseAlert({
        alertType: 'suspicious_activity',
        severity: 'medium',
        userId,
        description: `Suspicious activity detected: ${activityType}`,
        metadata: { ...metadata, count },
        timestamp: new Date()
      });
    }
  }

  /**
   * Track unauthorized access attempt
   */
  async trackUnauthorizedAccess(
    userId: string,
    resource: string,
    ipAddress?: string
  ): Promise<void> {
    await this.raiseAlert({
      alertType: 'unauthorized_access',
      severity: 'high',
      userId,
      ipAddress,
      description: `Unauthorized access attempt to ${resource}`,
      metadata: { resource },
      timestamp: new Date()
    });
  }

  /**
   * Detect anomalies in user behavior
   */
  async detectAnomaly(
    userId: string,
    metric: string,
    value: number,
    threshold: number
  ): Promise<void> {
    if (value > threshold) {
      await this.raiseAlert({
        alertType: 'anomaly',
        severity: 'medium',
        userId,
        description: `Anomaly detected: ${metric} = ${value} (threshold: ${threshold})`,
        metadata: { metric, value, threshold },
        timestamp: new Date()
      });
    }
  }

  /**
   * Check if identifier is blocked
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const blocked = await this.redis.get(`security:blocked:${identifier}`);
    return blocked !== null;
  }

  /**
   * Block identifier
   */
  async blockIdentifier(identifier: string, durationSeconds: number): Promise<void> {
    await this.redis.setex(
      `security:blocked:${identifier}`,
      durationSeconds,
      '1'
    );

    this.emit('identifierBlocked', { identifier, duration: durationSeconds });
  }

  /**
   * Unblock identifier
   */
  async unblockIdentifier(identifier: string): Promise<void> {
    await this.redis.del(`security:blocked:${identifier}`);
    this.emit('identifierUnblocked', { identifier });
  }

  /**
   * Raise security alert
   */
  private async raiseAlert(alert: SecurityAlert): Promise<void> {
    // Store alert in Redis
    const key = `security:alerts:${alert.alertType}`;
    await this.redis.zadd(
      key,
      alert.timestamp.getTime(),
      JSON.stringify(alert)
    );

    // Emit event
    this.emit('securityAlert', alert);

    // Send webhook notification
    if (this.config.alertWebhook) {
      await this.sendWebhookAlert(alert);
    }

    // Log to console
    console.error('🚨 SECURITY ALERT:', alert);
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: SecurityAlert): Promise<void> {
    try {
      const axios = require('axios');
      await axios.post(this.config.alertWebhook, {
        text: `🚨 Security Alert: ${alert.description}`,
        severity: alert.severity,
        timestamp: alert.timestamp,
        details: alert
      });
    } catch (error: any) {
      console.error('Failed to send webhook alert:', error.message);
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(
    alertType?: string,
    limit: number = 100
  ): Promise<SecurityAlert[]> {
    const pattern = alertType 
      ? `security:alerts:${alertType}`
      : 'security:alerts:*';
    
    const keys = await this.redis.keys(pattern);
    const alerts: SecurityAlert[] = [];

    for (const key of keys) {
      const items = await this.redis.zrevrange(key, 0, limit - 1);
      alerts.push(...items.map(item => JSON.parse(item)));
    }

    return alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(hours: number = 24): Promise<Record<string, number>> {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const keys = await this.redis.keys('security:alerts:*');
    const stats: Record<string, number> = {};

    for (const key of keys) {
      const alertType = key.split(':').pop()!;
      const count = await this.redis.zcount(key, cutoffTime, '+inf');
      stats[alertType] = count;
    }

    return stats;
  }

  /**
   * Clear old alerts
   */
  async clearOldAlerts(olderThanDays: number): Promise<void> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const keys = await this.redis.keys('security:alerts:*');

    for (const key of keys) {
      await this.redis.zremrangebyscore(key, '-inf', cutoffTime);
    }
  }
}
