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

  @Column({ type: 'varchar', length: 20, unique: true })
  agent_code!: string;

  @Column({ type: 'varchar', length: 200 })
  business_name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  business_type?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  license_number?: string;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  county?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  daily_limit!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monthly_limit!: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  commission_rate!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => AgentTerminal, terminal => terminal.agent)
  terminals!: AgentTerminal[];

  @OneToMany(() => AgentTransaction, transaction => transaction.agent)
  transactions!: AgentTransaction[];
}