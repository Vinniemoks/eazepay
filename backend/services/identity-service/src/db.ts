import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL not set; identity-service DB repository will be inactive.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function initDb() {
  if (!databaseUrl) return;
  await pool.query('SELECT 1');
}