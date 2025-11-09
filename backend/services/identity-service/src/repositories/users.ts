import { pool } from '../db';

export type User = {
  id: number;
  email: string;
  created_at: string;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const res = await pool.query('SELECT id, email, created_at FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function createUser(email: string): Promise<User> {
  const res = await pool.query(
    'INSERT INTO users(email) VALUES ($1) RETURNING id, email, created_at',
    [email]
  );
  return res.rows[0];
}