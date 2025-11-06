import { DataSource } from 'typeorm';
import * as path from 'path';
import { MigrationConfig, MigrationStatus, Migration, Logger } from './types';
import { getMigrationFiles, parseMigrationName } from './utils';

export class MigrationRunner {
  private dataSource: DataSource;
  private migrationsDir: string;
  private tableName: string;
  private logger?: Logger;

  constructor(config: MigrationConfig) {
    this.dataSource = config.dataSource;
    this.migrationsDir = config.migrationsDir;
    this.tableName = config.tableName || 'migrations';
    this.logger = config.logger;
  }

  /**
   * Initialize migrations table
   */
  private async ensureMigrationsTable(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          id SERIAL PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT NOW()
        )
      `);

      this.logger?.info('Migrations table initialized');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get executed migrations from database
   */
  private async getExecutedMigrations(): Promise<Set<string>> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const result = await queryRunner.query(
        `SELECT name FROM "${this.tableName}" ORDER BY timestamp ASC`
      );

      return new Set(result.map((row: any) => row.name));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Load migration files
   */
  private async loadMigrations(): Promise<Migration[]> {
    const files = getMigrationFiles(this.migrationsDir);
    const migrations: Migration[] = [];

    for (const file of files) {
      const filePath = path.join(this.migrationsDir, file);
      const { timestamp, name } = parseMigrationName(file);

      try {
        // Dynamic import
        const module = await import(filePath);
        const MigrationClass = Object.values(module)[0] as any;
        const instance = new MigrationClass();

        migrations.push({
          name: instance.name || `${timestamp}_${name}`,
          timestamp,
          up: instance.up.bind(instance),
          down: instance.down.bind(instance)
        });
      } catch (error) {
        this.logger?.error(`Failed to load migration ${file}`, { error });
        throw error;
      }
    }

    return migrations.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get migration status
   */
  async status(): Promise<MigrationStatus[]> {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.loadMigrations();

    return allMigrations.map(migration => ({
      name: migration.name,
      timestamp: migration.timestamp,
      status: executedMigrations.has(migration.name) ? 'executed' : 'pending'
    }));
  }

  /**
   * Run pending migrations
   */
  async up(count?: number): Promise<void> {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.loadMigrations();

    const pendingMigrations = allMigrations.filter(
      m => !executedMigrations.has(m.name)
    );

    if (pendingMigrations.length === 0) {
      this.logger?.info('No pending migrations');
      return;
    }

    const migrationsToRun = count
      ? pendingMigrations.slice(0, count)
      : pendingMigrations;

    this.logger?.info(`Running ${migrationsToRun.length} migration(s)`);

    for (const migration of migrationsToRun) {
      const queryRunner = this.dataSource.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        this.logger?.info(`Running migration: ${migration.name}`);
        await migration.up(this.dataSource);

        // Record migration
        await queryRunner.query(
          `INSERT INTO "${this.tableName}" (timestamp, name) VALUES ($1, $2)`,
          [migration.timestamp, migration.name]
        );

        await queryRunner.commitTransaction();
        this.logger?.info(`Migration completed: ${migration.name}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger?.error(`Migration failed: ${migration.name}`, { error });
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    this.logger?.info('All migrations completed successfully');
  }

  /**
   * Rollback migrations
   */
  async down(count: number = 1): Promise<void> {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = await this.loadMigrations();

    const executedMigrationsList = allMigrations
      .filter(m => executedMigrations.has(m.name))
      .reverse();

    if (executedMigrationsList.length === 0) {
      this.logger?.info('No migrations to rollback');
      return;
    }

    const migrationsToRollback = executedMigrationsList.slice(0, count);

    this.logger?.info(`Rolling back ${migrationsToRollback.length} migration(s)`);

    for (const migration of migrationsToRollback) {
      const queryRunner = this.dataSource.createQueryRunner();

      try {
        await queryRunner.startTransaction();

        this.logger?.info(`Rolling back migration: ${migration.name}`);
        await migration.down(this.dataSource);

        // Remove migration record
        await queryRunner.query(
          `DELETE FROM "${this.tableName}" WHERE name = $1`,
          [migration.name]
        );

        await queryRunner.commitTransaction();
        this.logger?.info(`Rollback completed: ${migration.name}`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger?.error(`Rollback failed: ${migration.name}`, { error });
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    this.logger?.info('All rollbacks completed successfully');
  }

  /**
   * Reset database (rollback all migrations)
   */
  async reset(): Promise<void> {
    const status = await this.status();
    const executedCount = status.filter(s => s.status === 'executed').length;

    if (executedCount === 0) {
      this.logger?.info('No migrations to reset');
      return;
    }

    this.logger?.warn(`Resetting database (rolling back ${executedCount} migrations)`);
    await this.down(executedCount);
  }

  /**
   * Refresh database (reset and re-run all migrations)
   */
  async refresh(): Promise<void> {
    this.logger?.info('Refreshing database');
    await this.reset();
    await this.up();
  }
}
