import { Request } from 'express';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SUPERUSER = 'SUPERUSER'
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
  sessionId?: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn?: string;
  issuer?: string;
  audience?: string;
  validateSession?: boolean;
  sessionValidator?: (sessionId: string) => Promise<boolean>;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  isValid: boolean;
  expiresAt?: Date;
}
