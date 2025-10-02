import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { AgentTerminal } from './AgentTerminal';
import { AgentTransaction } from './AgentTransaction';

@Entity({ name: 'agents' })
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  agent_id!: string;

  @Column('uuid')
  user_id!: string;

  @Column({ length: 20, unique: true })
  agent_code!: string;

  @Column({ length: 200 })
  business_name!: string;

  @Column({ length: 50, nullable: true })
  business_type?: string;

  @Column({ length: 100, nullable: true })
  license_number?: string;

  @Column({ type: 'point', nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  county?: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 200000.0 })
  daily_limit!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 5000000.0 })
  monthly_limit!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.005 })
  commission_rate!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => AgentTerminal, (terminal) => terminal.agent)
  terminals!: AgentTerminal[];

  @OneToMany(() => AgentTransaction, (transaction) => transaction.agent)
  transactions!: AgentTransaction[];
}
