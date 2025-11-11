import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HSMClient, MockHSMClient } from './hsm'; // Import HSMClient

export interface JWTOptions {
  jwtSecret: string;
  jwtExpiresIn: string;
  issuer: string;
  audience: string;
  hsmClient?: HSMClient; // Optional HSM client
  hsmKeyId?: string; // Key ID to use with HSM
}

export class JWTService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly hsmClient?: HSMClient;
  private readonly hsmKeyId?: string;

  constructor(options: JWTOptions) {
    this.jwtSecret = options.jwtSecret;
    this.jwtExpiresIn = options.jwtExpiresIn;
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.hsmClient = options.hsmClient;
    this.hsmKeyId = options.hsmKeyId;

    if (this.hsmClient && !this.hsmKeyId) {
      console.warn('HSMClient provided but no hsmKeyId. HSM signing will not be used.');
    }
  }

  /**
   * Signs a JWT token. If an HSM client is configured, it will be used for signing.
   * @param payload The payload to sign.
   * @returns The signed JWT token.
   */
  async sign(payload: object): Promise<string> {
    const signOptions: jwt.SignOptions = {
      expiresIn: this.jwtExpiresIn,
      issuer: this.issuer,
      audience: this.audience,
      algorithm: this.hsmClient && this.hsmKeyId ? 'none' : 'HS256', // Algorithm 'none' if HSM signs externally
    };

    const token = jwt.sign(payload, this.jwtSecret, signOptions);

    if (this.hsmClient && this.hsmKeyId) {
      // In a real scenario, the HSM would sign the JWT directly or a hash of it.
      // For this mock, we'll prepend a mock HSM signature.
      const hsmSignature = await this.hsmClient.sign(this.hsmKeyId, token);
      return `${hsmSignature}.${token}`; // Prepend mock HSM signature for demonstration
    }
    return token;
  }

  /**
   * Verifies a JWT token.
   * @param token The token to verify.
   * @returns The decoded payload if valid.
   */
  verify(token: string): object | string {
    // If HSM was used for signing, we'd first verify the HSM signature part.
    // For this mock, we'll strip the mock HSM signature before verifying the JWT.
    let actualToken = token;
    if (this.hsmClient && this.hsmKeyId && token.startsWith('mock-hsm-signature-')) {
      const parts = token.split('.');
      const hsmSignature = parts[0];
      actualToken = parts.slice(1).join('.'); // The actual JWT part

      // In a real scenario, you'd verify the HSM signature here.
      // For this mock, we assume the HSM verification is successful if it was signed by mock HSM.
      // const hsmVerified = await this.hsmClient.verify(this.hsmKeyId, actualToken, hsmSignature);
      // if (!hsmVerified) throw new Error('HSM signature verification failed');
    }

    return jwt.verify(actualToken, this.jwtSecret, {
      issuer: this.issuer,
      audience: this.audience,
    });
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // This is a placeholder for actual authentication logic.
  // In a real app, this would extract the token, verify it, and attach user info to req.
  console.log('Authentication middleware placeholder executed.');
  next();
}