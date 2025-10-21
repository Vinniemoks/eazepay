// Access Request model
// Task: 1.4 - Create access_requests table with approval workflow

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum RequestUrgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

@Entity('access_requests')
@Index(['status'])
@Index(['requesterId'])
@Index(['targetUserId'])
@Index(['createdAt'])
export class AccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column({ type: 'uuid' })
  targetUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  @Column({ type: 'text', array: true })
  requestedPermissions: string[];

  @Column({ type: 'text' })
  justification: string;

  @Column({ type: 'enum', enum: RequestUrgency, default: RequestUrgency.MEDIUM })
  urgency: RequestUrgency;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewedBy' })
  reviewer: User;

  @Column({ type: 'text', nullable: true })
  reviewReason: string;

  // Helper method to check if request is expired
  isExpired(): boolean {
    return new Date() > this.expiresAt && this.status === RequestStatus.PENDING;
  }

  // Helper method to check if request is pending
  isPending(): boolean {
    return this.status === RequestStatus.PENDING && !this.isExpired();
  }

  // Helper method to get days until expiry
  daysUntilExpiry(): number {
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
