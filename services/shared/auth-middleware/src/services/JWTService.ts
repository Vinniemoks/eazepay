import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { TokenPayload, AuthConfig } from '../types';
import { InvalidTokenError, TokenExpiredError } from '../errors';

export class JWTService {
  private config: Required<AuthConfig>;

  constructor(config: AuthConfig) {
    this.config = {
      jwtExpiresIn: '8h',
      issuer: 'afripay-services',
      audience: 'afripay-services',
      validateSession: false,
      sessionValidator: async () => true,
      ...config
    };

    if (!this.config.jwtSecret || this.config.jwtSecret === 'your-secret-key' || this.config.jwtSecret.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET is weak or default. Use a strong secret in production!');
    }
  }

  /**
   * Generate a JWT access token
   */
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
    const signOptions: SignOptions = {
      expiresIn: this.config.jwtExpiresIn,
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    return jwt.sign(payload, this.config.jwtSecret, signOptions);
  }

  /**
   * Generate a refresh token (longer expiry)
   */
  generateRefreshToken(userId: string, sessionId: string): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh'
    };

    const signOptions: SignOptions = {
      expiresIn: '7d',
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    return jwt.sign(payload, this.config.jwtSecret, signOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const verifyOptions: VerifyOptions = {
        issuer: this.config.issuer,
        audience: this.config.audience
      };

      const decoded = jwt.verify(token, this.config.jwtSecret, verifyOptions) as TokenPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredError();
      }
      throw new InvalidTokenError();
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Validate session if configured
   */
  async validateSession(sessionId: string): Promise<boolean> {
    if (!this.config.validateSession) {
      return true;
    }
    return this.config.sessionValidator(sessionId);
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
