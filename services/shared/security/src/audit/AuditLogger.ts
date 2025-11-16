import { EventEmitter } from 'events';
import winston from 'winston';
import Redis from 'ioredis';

export interface AuditEvent {
  eventType: string;
  userId?: string;
  sessionId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLoggerConfig {
  serviceName: string;
  redis?: Redis;
  logToFile?: boolean;
  logToConsole?: boolean;
  logToRedis?: boolean;
  retentionDays?: number;
  alertOnCritical?: boolean;
}

export class AuditLogger extends EventEmitter {
  private logger: winston.Logger;
  private redis?: Redis;
  private config: Required<AuditLoggerConfig>;

  constructor(config: AuditLoggerConfig) {
    super();
    this.config = {
      serviceName: config.serviceName,
      redis: config.redis,
      logToFile: config.logToFile !== false,
      logToConsole: config.logToConsole !== false,
      logToRedis: config.logToRedis !== false,
      retentionDays: config.retentionDays || 90,
      alertOnCritical: config.alertOnCritical !== false
    };

    this.redis = config.redis;
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger
   */
  private createLogger(): winston.Logger {
    const transports: winston.transport[] = [];

    if (this.config.logToConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          )
        })
      );
    }

    if (this.config.logToFile) {
      transports.push(
        new winston.transports.File({
          filename: `logs/audit-${this.config.serviceName}.log`,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          maxsize: 10485760, // 10MB
          maxFiles: 10
        })
      );
    }

    return winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: this.config.serviceName },
      transports
    });
  }

  /**
   * Log audit event
   */
  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    };

    // Log to Winston
    this.logger.info('Audit event', auditEvent);

    // Log to Redis for real-time monitoring
    if (this.config.logToRedis && this.redis) {
      await this.logToRedis(auditEvent);
    }

    // Emit event for real-time processing
    this.emit('auditEvent', auditEvent);

    // Alert on critical events
    if (this.config.alertOnCritical && event.severity === 'critical') {
      this.emit('criticalEvent', auditEvent);
    }
  }

  /**
   * Log to Redis for real-time monitoring
   */
  private async logToRedis(event: AuditEvent): Promise<void> {
    if (!this.redis) return;

    const key = `audit:${this.config.serviceName}:${event.eventType}`;
    const ttl = this.config.retentionDays * 24 * 60 * 60;

    try {
      // Store event
      await this.redis.zadd(
        key,
        event.timestamp.getTime(),
        JSON.stringify(event)
      );

      // Set expiration
      await this.redis.expire(key, ttl);

      // Track event counts
      await this.redis.hincrby(
        `audit:stats:${this.config.serviceName}`,
        event.eventType,
        1
      );
    } catch (error: any) {
      this.logger.error('Failed to log to Redis', { error: error.message });
    }
  }

  /**
   * Log authentication event
   */
  async logAuth(params: {
    userId?: string;
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'password_changed';
    status: 'success' | 'failure';
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      eventType: 'authentication',
      userId: params.userId,
      action: params.action,
      resource: 'auth',
      status: params.status,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata,
      severity: params.status === 'failure' ? 'high' : 'medium'
    });
  }

  /**
   * Log authorization event
   */
  async logAuthz(params: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    status: 'success' | 'failure';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      eventType: 'authorization',
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      status: params.status,
      metadata: params.metadata,
      severity: params.status === 'failure' ? 'high' : 'low'
    });
  }

  /**
   * Log data access event
   */
  async logDataAccess(params: {
    userId: string;
    action: 'read' | 'create' | 'update' | 'delete';
    resource: string;
    resourceId?: string;
    status: 'success' | 'failure';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      eventType: 'data_access',
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      status: params.status,
      metadata: params.metadata,
      severity: params.action === 'delete' ? 'high' : 'low'
    });
  }

  /**
   * Log security event
   */
  async logSecurity(params: {
    userId?: string;
    action: string;
    resource: string;
    status: 'success' | 'failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      eventType: 'security',
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      status: params.status,
      ipAddress: params.ipAddress,
      metadata: params.metadata,
      severity: params.severity
    });
  }

  /**
   * Log transaction event
   */
  async logTransaction(params: {
    userId: string;
    action: string;
    resourceId: string;
    status: 'success' | 'failure';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      eventType: 'transaction',
      userId: params.userId,
      action: params.action,
      resource: 'transaction',
      resourceId: params.resourceId,
      status: params.status,
      metadata: params.metadata,
      severity: 'high'
    });
  }

  /**
   * Get audit events by type
   */
  async getEvents(
    eventType: string,
    startTime: Date,
    endTime: Date
  ): Promise<AuditEvent[]> {
    if (!this.redis) {
      throw new Error('Redis not configured');
    }

    const key = `audit:${this.config.serviceName}:${eventType}`;
    const events = await this.redis.zrangebyscore(
      key,
      startTime.getTime(),
      endTime.getTime()
    );

    return events.map(e => JSON.parse(e));
  }

  /**
   * Get audit statistics
   */
  async getStats(): Promise<Record<string, number>> {
    if (!this.redis) {
      throw new Error('Redis not configured');
    }

    const stats = await this.redis.hgetall(`audit:stats:${this.config.serviceName}`);
    const result: Record<string, number> = {};

    for (const [key, value] of Object.entries(stats)) {
      result[key] = parseInt(value, 10);
    }

    return result;
  }

  /**
   * Cleanup old events
   */
  async cleanup(olderThanDays: number): Promise<void> {
    if (!this.redis) return;

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const pattern = `audit:${this.config.serviceName}:*`;
    
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      await this.redis.zremrangebyscore(key, '-inf', cutoffTime);
    }
  }
}
