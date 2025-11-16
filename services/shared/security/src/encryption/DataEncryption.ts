import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm?: string;
  keyLength?: number;
  ivLength?: number;
  saltLength?: number;
  iterations?: number;
  digest?: string;
}

export class DataEncryption {
  private algorithm: string;
  private keyLength: number;
  private ivLength: number;
  private saltLength: number;
  private iterations: number;
  private digest: string;
  private masterKey: Buffer;

  constructor(masterKey: string, config: EncryptionConfig = {}) {
    this.algorithm = config.algorithm || 'aes-256-gcm';
    this.keyLength = config.keyLength || 32;
    this.ivLength = config.ivLength || 16;
    this.saltLength = config.saltLength || 64;
    this.iterations = config.iterations || 100000;
    this.digest = config.digest || 'sha512';

    // Derive master key
    this.masterKey = Buffer.from(masterKey, 'hex');
    
    if (this.masterKey.length !== this.keyLength) {
      throw new Error(`Master key must be ${this.keyLength} bytes (${this.keyLength * 2} hex characters)`);
    }
  }

  /**
   * Encrypt data
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random IV
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
      
      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag (for GCM mode)
      const authTag = cipher.getAuthTag();
      
      // Combine IV + authTag + encrypted data
      const result = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      return result.toString('base64');
    } catch (error: any) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data
   */
  decrypt(ciphertext: string): string {
    try {
      // Decode from base64
      const buffer = Buffer.from(ciphertext, 'base64');
      
      // Extract IV, auth tag, and encrypted data
      const iv = buffer.slice(0, this.ivLength);
      const authTag = buffer.slice(this.ivLength, this.ivLength + 16);
      const encrypted = buffer.slice(this.ivLength + 16);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error: any) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt object (JSON)
   */
  encryptObject(obj: any): string {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  /**
   * Decrypt object (JSON)
   */
  decryptObject<T = any>(ciphertext: string): T {
    const json = this.decrypt(ciphertext);
    return JSON.parse(json);
  }

  /**
   * Hash data (one-way)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const useSalt = salt || crypto.randomBytes(this.saltLength).toString('hex');
    
    const hash = crypto.pbkdf2Sync(
      data,
      useSalt,
      this.iterations,
      this.keyLength,
      this.digest
    ).toString('hex');
    
    return { hash, salt: useSalt };
  }

  /**
   * Verify hash
   */
  verifyHash(data: string, hash: string, salt: string): boolean {
    const computed = this.hash(data, salt);
    return crypto.timingSafeEqual(
      Buffer.from(computed.hash),
      Buffer.from(hash)
    );
  }

  /**
   * Generate encryption key
   */
  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt field in database model
   */
  encryptField(value: any): string {
    if (value === null || value === undefined) {
      return value;
    }
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return this.encrypt(stringValue);
  }

  /**
   * Decrypt field from database model
   */
  decryptField(encryptedValue: string): any {
    if (!encryptedValue) {
      return encryptedValue;
    }
    
    try {
      const decrypted = this.decrypt(encryptedValue);
      
      // Try to parse as JSON
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      // If decryption fails, return original value
      // This handles cases where data might not be encrypted
      return encryptedValue;
    }
  }

  /**
   * Encrypt sensitive PII fields
   */
  encryptPII(data: Record<string, any>, fields: string[]): Record<string, any> {
    const encrypted = { ...data };
    
    for (const field of fields) {
      if (encrypted[field]) {
        encrypted[field] = this.encryptField(encrypted[field]);
      }
    }
    
    return encrypted;
  }

  /**
   * Decrypt sensitive PII fields
   */
  decryptPII(data: Record<string, any>, fields: string[]): Record<string, any> {
    const decrypted = { ...data };
    
    for (const field of fields) {
      if (decrypted[field]) {
        decrypted[field] = this.decryptField(decrypted[field]);
      }
    }
    
    return decrypted;
  }

  /**
   * Tokenize sensitive data (for display)
   */
  tokenize(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return data;
    }
    
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }
}

/**
 * Field-level encryption decorator for TypeORM
 */
export function Encrypted(encryptionService: DataEncryption) {
  return function (target: any, propertyKey: string) {
    const privateKey = `_${propertyKey}`;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        const encrypted = this[privateKey];
        return encrypted ? encryptionService.decryptField(encrypted) : encrypted;
      },
      set(value: any) {
        this[privateKey] = value ? encryptionService.encryptField(value) : value;
      },
      enumerable: true,
      configurable: true
    });
  };
}
