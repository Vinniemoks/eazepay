// Transaction model with millisecond precision
// Task: 5.1 - Create transaction recording endpoint
// Requirements: 2.1, 9.1, 9.2, 24.1, 24.2

import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import Decimal from 'decimal.js';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
  COMMISSION = 'COMMISSION',
  REVERSAL = 'REVERSAL'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED'
}

@Entity('transactions')
@Index(['timestamp'])
@Index(['fromUserId', 'timestamp'])
@Index(['toUserId', 'timestamp'])
@Index(['type', 'timestamp'])
@Index(['status'])
@Index(['idempotencyKey'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Millisecond-precision timestamp
  @Column({ type: 'timestamptz', precision: 3 })
  timestamp: Date;

  @Column({ type: 'bigint' })
  sequenceNumber: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 3, default: 'KES' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  fromUserId: string;

  @Column({ type: 'uuid', nullable: true })
  toUserId: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  fees: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  idempotencyKey: string;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', precision: 3 })
  updatedAt: Date;

  // Helper methods
  getAmountAsDecimal(): Decimal {
    return new Decimal(this.amount);
  }

  getFeesAsDecimal(): Decimal {
    return new Decimal(this.fees);
  }

  getTotalAmount(): Decimal {
    return this.getAmountAsDecimal().plus(this.getFeesAsDecimal());
  }

  // Format timestamp with milliseconds
  getFormattedTimestamp(timezone: string = 'UTC'): string {
    return this.timestamp.toISOString(); // ISO 8601 with milliseconds
  }
}
