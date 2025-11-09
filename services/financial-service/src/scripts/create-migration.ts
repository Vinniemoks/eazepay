#!/usr/bin/env ts-node

import { createMigration } from '@eazepay/migrations';
import * as path from 'path';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Migration name is required');
  console.log('\nUsage: npm run migration:create <name>');
  console.log('\nExample: npm run migration:create add_user_avatar');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, '../migrations');

try {
  const filePath = createMigration(migrationsDir, migrationName);
  console.log(`✓ Migration created: ${filePath}`);
  console.log('\nNext steps:');
  console.log('1. Edit the migration file to add your changes');
  console.log('2. Run: npm run migrate up');
} catch (error) {
  console.error('Failed to create migration:', error);
  process.exit(1);
}
