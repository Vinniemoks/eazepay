// Database configuration for Identity Service
// Phase 2: Identity & Authentication Service

import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { UserPermission } from '../models/UserPermission';
import { PermissionCode } from '../models/PermissionCode';
import { AccessRequest } from '../models/AccessRequest';
import { AuditLog } from '../models/AuditLog';
import { Session } from '../models/Session';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USER || 'developer',
  password: process.env.DB_PASS || 'dev_password_2024!',
  database: process.env.DB_NAME || 'afripay_dev',
  synchronize: false, // Use migrations instead
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserPermission, PermissionCode, AccessRequest, AuditLog, Session],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  extra: {
    // Connection pool settings
    max: 50,
    min: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
  // Enable SSL in production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
});

// Initialize database connection
export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}
