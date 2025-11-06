import { DataSource } from 'typeorm';

export class CreateTransactionsTable1699267800000 {
  name = '1699267800000_create_transactions_table';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "type" varchar(50) NOT NULL,
        "amount" decimal(15,2) NOT NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'KES',
        "status" varchar(50) NOT NULL DEFAULT 'PENDING',
        "from_user_id" uuid,
        "to_user_id" uuid,
        "description" text,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_amount_positive" CHECK (amount > 0)
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_from_user_id" ON "transactions" ("from_user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_to_user_id" ON "transactions" ("to_user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_status" ON "transactions" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_created_at" ON "transactions" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_type" ON "transactions" ("type")
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_to_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_from_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
  }
}
