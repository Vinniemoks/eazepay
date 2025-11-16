import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';
import { query } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  static async register(data: {
    phoneNumber: string;
    email?: string;
    fullName: string;
    nationalId?: string;
    password: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await UserModel.findByPhoneNumber(data.phoneNumber);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    if (data.email) {
      const existingEmail = await UserModel.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Create user
    const user = await UserModel.create(data);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  static async login(phoneNumber: string, password: string, deviceInfo?: any): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user
    const user = await UserModel.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user, deviceInfo);

    return { user, tokens };
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

      // Check if session exists
      const result = await query(
        'SELECT * FROM sessions WHERE user_id = $1 AND refresh_token = $2 AND expires_at > NOW()',
        [decoded.userId, refreshToken]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(userId: string, refreshToken: string): Promise<void> {
    await query('DELETE FROM sessions WHERE user_id = $1 AND refresh_token = $2', [userId, refreshToken]);
  }

  static async logoutAll(userId: string): Promise<void> {
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }

  private static async generateTokens(user: User, deviceInfo?: any): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    // Generate access token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    // Store session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO sessions (user_id, refresh_token, device_info, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, refreshToken, JSON.stringify(deviceInfo || {}), expiresAt]
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };
  }

  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
