import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Agent } from './Agent';

@Entity({ name: 'agent_terminals' })
export class AgentTerminal {
  @PrimaryGeneratedColumn('uuid')
  terminal_id!: string;

  @ManyToOne(() => Agent, (agent: Agent) => agent.terminals, { onDelete: 'CASCADE' })
  agent!: Agent;

  @Column({ type: 'uuid' })
  agent_id!: string;

  @Column({ unique: true })
  serial_number!: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  firmware_version?: string;

  @Column({ default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED';

  @Column({ type: 'timestamp', nullable: true })
  last_ping?: Date;

  @Column({ type: 'int', nullable: true })
  battery_level?: number;

  @Column({ type: 'point', nullable: true })
  location?: string;

  @Column({ default: false })
  is_online!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;
}
