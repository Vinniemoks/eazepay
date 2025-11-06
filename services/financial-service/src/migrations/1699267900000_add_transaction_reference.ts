import { DataSource } from 'typeorm';

export class AddTransactionReference1699267900000 {
  name = '1699267900000_add_transaction_reference';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    // Add reference column
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD COLUMN "reference" varchar(100) UNIQUE
    `);

    // Create index on reference
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_reference" ON "transactions" ("reference")
    `);

    // Generate references for existing transactions
    await queryRunner.query(`
      UPDATE "transactions"
      SET "reference" = 'TXN-' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 10))
      WHERE "reference" IS NULL
    `);

    // Make reference NOT NULL
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "reference" SET NOT NULL
    `);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_transactions_reference"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "reference"`);
  }
}
