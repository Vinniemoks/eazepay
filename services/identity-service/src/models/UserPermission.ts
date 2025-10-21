// User Permission model
// Task: 1.3 - Create user_permissions junction table

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { PermissionCode } from './PermissionCode';

@Entity('user_permissions')
@Unique(['userId', 'permissionCode'])
@Index(['userId'])
@Index(['permissionCode'])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  permissionCode: string;

  @ManyToOne(() => PermissionCode)
  @JoinColumn({ name: 'permissionCode' })
  permission: PermissionCode;

  @CreateDateColumn({ type: 'timestamptz' })
  grantedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  grantedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'grantedBy' })
  grantor: User;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Helper method to check if permission is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Helper method to check if permission is active
  isActive(): boolean {
    return !this.isExpired();
  }
}
