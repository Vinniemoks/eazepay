// Permission Code model
// Task: 1.2 - Create permission_codes table with versioning

import { Entity, Column, PrimaryColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum PermissionAction {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT'
}

export enum Department {
  FINANCE = 'FINANCE',
  OPERATIONS = 'OPERATIONS',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  COMPLIANCE = 'COMPLIANCE',
  IT = 'IT',
  MANAGEMENT = 'MANAGEMENT'
}

@Entity('permission_codes')
@Index(['department'])
@Index(['deprecated'])
export class PermissionCode {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ type: 'enum', enum: PermissionAction })
  action: PermissionAction;

  @Column({ type: 'varchar', length: 20, default: '1.0.0' })
  version: string;

  @Column({ type: 'boolean', default: false })
  deprecated: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  replacementCode: string;

  @ManyToOne(() => PermissionCode, { nullable: true })
  @JoinColumn({ name: 'replacementCode' })
  replacement: PermissionCode;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deprecatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
