#!/usr/bin/env ts-node

import { MigrationRunner } from '@eazepay/migrations';
import { AppDataSource } from '../config/database';
import logger from '../utils/logger';

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connected');

    // Create migration runner
    const runner = new MigrationRunner({
      dataSource: AppDataSource,
      migrationsDir: __dirname + '/../migrations',
      tableName: 'migrations',
      logger
    });

    switch (command) {
      case 'up':
        const count = arg ? parseInt(arg) : undefined;
        await runner.up(count);
        break;

      case 'down':
        const rollbackCount = arg ? parseInt(arg) : 1;
        await runner.down(rollbackCount);
        break;

      case 'status':
        const status = await runner.status();
        console.log('\nMigration Status:');
        console.log('─'.repeat(80));
        status.forEach(m => {
          const statusIcon = m.status === 'executed' ? '✓' : '○';
          const date = m.executedAt ? new Date(m.executedAt).toISOString() : 'Not executed';
          console.log(`${statusIcon} ${m.name} (${date})`);
        });
        console.log('─'.repeat(80));
        break;

      case 'reset':
        await runner.reset();
        break;

      case 'refresh':
        await runner.refresh();
        break;

      default:
        console.log(`
Usage: npm run migrate <command> [options]

Commands:
  up [count]     Run pending migrations (optionally specify count)
  down [count]   Rollback migrations (default: 1)
  status         Show migration status
  reset          Rollback all migrations
  refresh        Reset and re-run all migrations

Examples:
  npm run migrate up           # Run all pending migrations
  npm run migrate up 1         # Run one migration
  npm run migrate down         # Rollback last migration
  npm run migrate down 2       # Rollback last 2 migrations
  npm run migrate status       # Show migration status
  npm run migrate reset        # Rollback all migrations
  npm run migrate refresh      # Reset and re-run all
        `);
        process.exit(1);
    }

    await AppDataSource.destroy();
    logger.info('Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { error });
    process.exit(1);
  }
}

main();
