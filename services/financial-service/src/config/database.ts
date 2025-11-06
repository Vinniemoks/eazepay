// Database configuration for Financial Service
import { DataSource } from 'typeorm';
import { Transaction } from '../models/Transaction';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'fintech_db',
  entities: [Transaction],
  synchronize: false, // Use migrations instead
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '30'),
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000')
  }
});
