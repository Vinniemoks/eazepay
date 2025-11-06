import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Agent } from '../entities/Agent';
import { AgentTerminal } from '../entities/AgentTerminal';
import { AgentTransaction } from '../entities/AgentTransaction';

dotenv.config();

export const AgentDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'developer',
  password: process.env.DB_PASS || 'dev_password_2024!',
  database: process.env.DB_NAME || 'afripay_dev',
  entities: [Agent, AgentTerminal, AgentTransaction],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '30', 10),
    min: parseInt(process.env.DB_POOL_MIN || '5', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000', 10)
  }
});
