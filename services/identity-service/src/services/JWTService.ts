import jwt, { SignOptions } from 'jsonwebtoken';

export class JWTService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

    static generateToken(payload: object): string {
        const options: SignOptions = {
            expiresIn: this.JWT_EXPIRES_IN as any // Cast to any to bypass type checking
        };
        
        return jwt.sign(payload, this.JWT_SECRET, options);
    }

    static verifyToken(token: string): any {
        return jwt.verify(token, this.JWT_SECRET);
    }
}