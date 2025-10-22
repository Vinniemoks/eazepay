import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export enum TwoFactorMethod {
  SMS = 'SMS',
  BIOMETRIC = 'BIOMETRIC',
  BOTH = 'BOTH'
}

export enum VerificationType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  HUDUMA = 'HUDUMA',
  BUSINESS_REGISTRATION = 'BUSINESS_REGISTRATION'
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'enum', enum: TwoFactorMethod, nullable: true })
  twoFactorMethod: TwoFactorMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'boolean', default: false })
  biometricEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  biometricTemplateId: string;

  @Column({ type: 'enum', enum: VerificationType, nullable: true })
  verificationType: VerificationType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  verificationNumber: string;

  @Column({ type: 'boolean', default: false })
  governmentVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  verificationDocuments: {
    type: string;
    url: string;
    uploadedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  }[];

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  businessDetails: {
    businessName: string;
    registrationNumber: string;
    taxNumber: string;
    businessType: string;
    registrationDate: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  organizationId: string;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
