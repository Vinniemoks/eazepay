import { query } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName: string;
  nationalId?: string;
  passwordHash: string;
  status: 'active' | 'suspended' | 'inactive';
  role: 'customer' | 'agent' | 'admin' | 'superuser';
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class UserModel {
  static async create(data: {
    phoneNumber: string;
    email?: string;
    fullName: string;
    nationalId?: string;
    password: string;
    role?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 12);
    
    const result = await query(
      `INSERT INTO users (phone_number, email, full_name, national_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.phoneNumber, data.email, data.fullName, data.nationalId, passwordHash, data.role || 'customer']
    );
    
    return this.mapToUser(result.rows[0]);
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  static async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
  }

  static async updateStatus(userId: string, status: string): Promise<void> {
    await query('UPDATE users SET status = $1 WHERE id = $2', [status, userId]);
  }

  static async updateKycStatus(userId: string, kycStatus: string): Promise<void> {
    await query('UPDATE users SET kyc_status = $1 WHERE id = $2', [kycStatus, userId]);
  }

  private static mapToUser(row: any): User {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      email: row.email,
      fullName: row.full_name,
      nationalId: row.national_id,
      passwordHash: row.password_hash,
      status: row.status,
      role: row.role,
      emailVerified: row.email_verified,
      phoneVerified: row.phone_verified,
      kycStatus: row.kyc_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at
    };
  }
}
