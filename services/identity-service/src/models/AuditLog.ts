// Audit Log model
// Task: 1.6 - Create audit_logs table with tamper-evident design

import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum AuditActionType {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ACCESS_REQUEST_CREATED = 'ACCESS_REQUEST_CREATED',
  ACCESS_REQUEST_APPROVED = 'ACCESS_REQUEST_APPROVED',
  ACCESS_REQUEST_REJECTED = 'ACCESS_REQUEST_REJECTED',
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  PERMISSION_CODE_CREATED = 'PERMISSION_CODE_CREATED',
  PERMISSION_CODE_DEPRECATED = 'PERMISSION_CODE_DEPRECATED',
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  EMERGENCY_ACCESS_GRANTED = 'EMERGENCY_ACCESS_GRANTED'
}

@Entity('audit_logs')
@Index(['timestamp'])
@Index(['actorUserId', 'timestamp'])
@Index(['actionType', 'timestamp'])
@Index(['resourceType', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'timestamptz', precision: 3 })
  timestamp: Date;

  @Column({ type: 'uuid' })
  actorUserId: string;

  @Column({ type: 'enum', enum: ['SUPERUSER', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'AGENT'] })
  actorRole: string;

  @Column({ type: 'inet', nullable: true })
  actorIpAddress: string;

  @Column({ type: 'text', nullable: true })
  actorUserAgent: string;

  @Column({ type: 'enum', enum: AuditActionType })
  actionType: AuditActionType;

  @Column({ type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  beforeValue: any;

  @Column({ type: 'jsonb', nullable: true })
  afterValue: any;

  @Column({ type: 'uuid' })
  correlationId: string;

  @Column({ type: 'uuid', nullable: true })
  traceId: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  previousLogHash: string;

  @Column({ type: 'varchar', length: 64 })
  entryHash: string;

  @Column({ type: 'text', nullable: true })
  signature: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
