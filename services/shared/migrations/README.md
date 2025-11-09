# @eazepay/migrations

Database migration utilities for Eazepay microservices with TypeORM support.

## Features

- ✅ TypeORM-based migrations
- ✅ Transaction support (rollback on failure)
- ✅ Migration versioning
- ✅ Up/down migrations
- ✅ Migration status tracking
- ✅ Batch migrations
- ✅ Reset and refresh commands
- ✅ Automatic migration table creation
- ✅ TypeScript support
- ✅ Logging integration

## Installation

```bash
cd services/shared/migrations
npm install
npm run build
```

Then in your service:

```bash
npm install file:../shared/migrations
```

## Quick Start

### 1. Create Migration Script

```typescript
// src/scripts/migrate.ts
import { MigrationRunner } from '@eazepay/migrations';
import { AppDataSource } from '../config/database';
import logger from '../utils/logger';

async function main() {
  await AppDataSource.initialize();

  const runner = new MigrationRunner({
    dataSource: AppDataSource,
    migrationsDir: __dirname + '/../migrations',
    tableName: 'migrations',
    logger
  });

  const command = process.argv[2];
  
  switch (command) {
    case 'up':
      await runner.up();
      break;
    case 'down':
      await runner.down();
      break;
    case 'status':
      const status = await runner.status();
      console.log(status);
      break;
  }

  await AppDataSource.destroy();
}

main();
```

### 2. Add Scripts to package.json

```json
{
  "scripts": {
    "migrate": "ts-node src/scripts/migrate.ts",
    "migrate:up": "ts-node src/scripts/migrate.ts up",
    "migrate:down": "ts-node src/scripts/migrate.ts down",
    "migrate:status": "ts-node src/scripts/migrate.ts status",
    "migration:create": "ts-node src/scripts/create-migration.ts"
  }
}
```

### 3. Create a Migration

```bash
npm run migration:create add_user_avatar
```

This creates a file like `1699267800000_add_user_avatar.ts`:

```typescript
import { DataSource } from 'typeorm';

export class AddUserAvatar1699267800000 {
  name = '1699267800000_add_user_avatar';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "avatar_url" varchar(500)
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "avatar_url"
    `);
  }
}
```

### 4. Run Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Rollback last 2 migrations
npm run migrate down 2
```

## Commands

### Run Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Run specific number of migrations
npm run migrate up 1
npm run migrate up 3
```

### Rollback Migrations

```bash
# Rollback last migration
npm run migrate:down

# Rollback specific number of migrations
npm run migrate down 2
npm run migrate down 5
```

### Migration Status

```bash
npm run migrate:status
```

Output:
```
Migration Status:
────────────────────────────────────────────────────────────────────────────────
✓ 1699267800000_create_transactions_table (2025-11-06T10:30:00.000Z)
✓ 1699267900000_add_transaction_reference (2025-11-06T10:31:00.000Z)
○ 1699268000000_add_transaction_metadata (Not executed)
────────────────────────────────────────────────────────────────────────────────
```

### Reset Database

```bash
# Rollback all migrations
npm run migrate:reset
```

### Refresh Database

```bash
# Reset and re-run all migrations
npm run migrate:refresh
```

## Migration Examples

### Create Table

```typescript
import { DataSource } from 'typeorm';

export class CreateUsersTable1699267800000 {
  name = '1699267800000_create_users_table';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "full_name" varchar(255) NOT NULL,
        "phone_number" varchar(20),
        "role" varchar(50) NOT NULL DEFAULT 'CUSTOMER',
        "status" varchar(50) NOT NULL DEFAULT 'ACTIVE',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_phone_number" ON "users" ("phone_number")
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_phone_number"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
```

### Add Column

```typescript
import { DataSource } from 'typeorm';

export class AddUserAvatar1699267900000 {
  name = '1699267900000_add_user_avatar';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "avatar_url" varchar(500)
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "avatar_url"
    `);
  }
}
```

### Add Index

```typescript
import { DataSource } from 'typeorm';

export class AddTransactionStatusIndex1699268000000 {
  name = '1699268000000_add_transaction_status_index';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_status_created_at"
      ON "transactions" ("status", "created_at")
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_transactions_status_created_at"
    `);
  }
}
```

### Add Foreign Key

```typescript
import { DataSource } from 'typeorm';

export class AddTransactionUserForeignKeys1699268100000 {
  name = '1699268100000_add_transaction_user_foreign_keys';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_from_user"
      FOREIGN KEY ("from_user_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_transactions_to_user"
      FOREIGN KEY ("to_user_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP CONSTRAINT IF EXISTS "FK_transactions_to_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      DROP CONSTRAINT IF EXISTS "FK_transactions_from_user"
    `);
  }
}
```

### Data Migration

```typescript
import { DataSource } from 'typeorm';

export class MigrateUserRoles1699268200000 {
  name = '1699268200000_migrate_user_roles';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    // Update old role names to new ones
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'CUSTOMER'
      WHERE "role" = 'USER'
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'ADMIN'
      WHERE "role" = 'ADMINISTRATOR'
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'USER'
      WHERE "role" = 'CUSTOMER'
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'ADMINISTRATOR'
      WHERE "role" = 'ADMIN'
    `);
  }
}
```

## Best Practices

### 1. Always Write Down Migrations

Every `up()` migration should have a corresponding `down()` migration:

```typescript
// Good
public async up(dataSource: DataSource): Promise<void> {
  await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "avatar" varchar(500)`);
}

public async down(dataSource: DataSource): Promise<void> {
  await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
}
```

### 2. Use Transactions

Migrations automatically run in transactions, but be aware:

```typescript
// Each query is part of the transaction
public async up(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  
  // If any query fails, all will be rolled back
  await queryRunner.query(`...`);
  await queryRunner.query(`...`);
}
```

### 3. Test Migrations

Always test both up and down:

```bash
# Run migration
npm run migrate:up

# Test rollback
npm run migrate:down

# Re-run migration
npm run migrate:up
```

### 4. Never Modify Executed Migrations

Once a migration is executed in production, never modify it. Create a new migration instead.

### 5. Use Descriptive Names

```bash
# Good
npm run migration:create add_user_avatar
npm run migration:create create_transactions_table
npm run migration:create add_transaction_status_index

# Avoid
npm run migration:create update
npm run migration:create fix
```

### 6. Keep Migrations Small

One migration = one logical change:

```bash
# Good
npm run migration:create add_user_avatar
npm run migration:create add_user_bio

# Avoid (too many changes in one migration)
npm run migration:create update_user_table_with_many_changes
```

## CI/CD Integration

### Run Migrations on Deploy

```yaml
# .github/workflows/deploy.yml
- name: Run database migrations
  run: |
    cd services/financial-service
    npm run migrate:up
```

### Check Migration Status

```yaml
- name: Check migration status
  run: |
    cd services/financial-service
    npm run migrate:status
```

## Troubleshooting

### Migration Failed

If a migration fails, it will be rolled back automatically:

```bash
# Check status
npm run migrate:status

# Fix the migration file
# Re-run
npm run migrate:up
```

### Migration Table Not Found

The migrations table is created automatically on first run. If you see this error, ensure your database connection is working.

### Duplicate Migration Names

Each migration must have a unique name. The timestamp ensures uniqueness.

## Support

For issues or questions:
1. Check this README
2. Review migration logs
3. Check database connection
4. Contact DevOps team

---

**Version**: 1.0.0  
**License**: MIT  
**Maintained By**: Eazepay DevOps Team
