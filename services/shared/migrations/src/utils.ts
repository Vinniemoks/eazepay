import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate migration name with timestamp
 */
export function generateMigrationName(name: string): string {
  const timestamp = Date.now();
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
  return `${timestamp}_${sanitizedName}`;
}

/**
 * Create a new migration file
 */
export function createMigration(
  migrationsDir: string,
  name: string
): string {
  const migrationName = generateMigrationName(name);
  const fileName = `${migrationName}.ts`;
  const filePath = path.join(migrationsDir, fileName);

  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  // Migration template
  const template = `import { DataSource } from 'typeorm';

export class ${toPascalCase(name)}${Date.now()} {
  name = '${migrationName}';

  public async up(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    // Write your migration here
    // Example:
    // await queryRunner.query(\`
    //   CREATE TABLE "users" (
    //     "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    //     "email" varchar(255) NOT NULL UNIQUE,
    //     "created_at" timestamp DEFAULT now()
    //   )
    // \`);
  }

  public async down(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    // Write your rollback here
    // Example:
    // await queryRunner.query(\`DROP TABLE "users"\`);
  }
}
`;

  fs.writeFileSync(filePath, template);
  return filePath;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Get all migration files from directory
 */
export function getMigrationFiles(migrationsDir: string): string[] {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort();
}

/**
 * Parse migration name to get timestamp
 */
export function parseMigrationName(fileName: string): {
  timestamp: number;
  name: string;
} {
  const match = fileName.match(/^(\d+)_(.+)\.(ts|js)$/);
  if (!match) {
    throw new Error(`Invalid migration file name: ${fileName}`);
  }

  return {
    timestamp: parseInt(match[1]),
    name: match[2]
  };
}
