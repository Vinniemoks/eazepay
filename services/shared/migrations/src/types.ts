import { DataSource } from 'typeorm';

export interface MigrationConfig {
  dataSource: DataSource;
  migrationsDir: string;
  tableName?: string;
  logger?: Logger;
}

export interface Logger {
  info: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
}

export interface MigrationStatus {
  name: string;
  timestamp: number;
  executedAt?: Date;
  status: 'pending' | 'executed' | 'failed';
}

export interface Migration {
  name: string;
  timestamp: number;
  up: (dataSource: DataSource) => Promise<void>;
  down: (dataSource: DataSource) => Promise<void>;
}

export interface MigrationRecord {
  id: number;
  timestamp: bigint;
  name: string;
  executed_at: Date;
}
