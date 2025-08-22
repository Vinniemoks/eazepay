import jwt from 'jsonwebtoken';

export class JWTService {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
  }

  generateToken(payload: any, expiresIn: string = '24h'): string {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
