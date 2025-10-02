import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Agent } from './Agent';
import { AgentTerminal } from './AgentTerminal';

@Entity({ name: 'agent_transactions' })
export class AgentTransaction {
  @PrimaryGeneratedColumn('uuid')
  agent_transaction_id!: string;

  @Column('uuid')
  transaction_id!: string;

  @ManyToOne(() => Agent, (agent) => agent.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent!: Agent;

  @Column('uuid')
  agent_id!: string;

  @ManyToOne(() => AgentTerminal, { nullable: true })
  @JoinColumn({ name: 'terminal_id' })
  terminal?: AgentTerminal | null;

  @Column({ type: 'uuid', nullable: true })
  terminal_id?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission_earned!: string;

  @Column({ length: 20, nullable: true })
  customer_phone?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
