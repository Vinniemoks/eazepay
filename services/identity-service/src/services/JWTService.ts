import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export class JWTService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1h';

    static generateToken(payload: object): string {
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN as any
        });
    }

    static verifyToken(token: string): string | JwtPayload {
        return jwt.verify(token, this.JWT_SECRET);
    }
}