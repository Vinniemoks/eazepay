import jwt, { JwtPayload } from 'jsonwebtoken';

interface JWTOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  issuer?: string;
  audience?: string;
}

export class JWTService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly issuer?: string;
  private readonly audience?: string;

  constructor(opts: JWTOptions) {
    this.secret = opts.jwtSecret;
    this.expiresIn = opts.jwtExpiresIn;
    this.issuer = opts.issuer;
    this.audience = opts.audience;
  }

  generateToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
      issuer: this.issuer,
      audience: this.audience
    });
  }

  generateRefreshToken(userId: string, sessionId: string): string {
    return jwt.sign({ type: 'refresh', userId, sessionId }, this.secret, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      issuer: this.issuer,
      audience: this.audience
    });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret, {
      issuer: this.issuer,
      audience: this.audience
    }) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch {
      return null;
    }
  }
}