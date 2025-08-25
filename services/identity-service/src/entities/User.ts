import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BiometricTemplate } from './BiometricTemplate';

export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum AccountTier {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  password: string; 

  @Column({ nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING
  })
  kycStatus: KYCStatus;

  @Column({
    type: 'enum',
    enum: AccountTier,
    default: AccountTier.BASIC
  })
  accountTier: AccountTier;

  @Column({ default: 0 })
  authLevel: number; // 0=none, 1=basic, 2=biometric, 3=full

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => BiometricTemplate, template => template.user)
  biometricTemplates: BiometricTemplate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
