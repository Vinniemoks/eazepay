// Session model for authentication
// Task: 2.3 - Build session management with refresh tokens

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('sessions')
@Index(['userId', 'expiresAt'])
@Index(['refreshToken'], { unique: true })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  accessToken: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  refreshToken: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz' })
  refreshTokenExpiresAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string; // 'web', 'mobile', 'tablet'

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Helper method to check if session is expired
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  // Helper method to check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    return new Date() > this.refreshTokenExpiresAt;
  }

  // Helper method to check if session needs refresh
  needsRefresh(): boolean {
    const now = new Date();
    const timeUntilExpiry = this.expiresAt.getTime() - now.getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    return timeUntilExpiry < thirtyMinutes && !this.isRefreshTokenExpired();
  }
}
