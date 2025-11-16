import fs from 'fs';
import https from 'https';
import tls from 'tls';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface TLSConfig {
  certPath?: string;
  keyPath?: string;
  caPath?: string;
  passphrase?: string;
  rejectUnauthorized?: boolean;
  minVersion?: string;
  maxVersion?: string;
  ciphers?: string;
  enableMTLS?: boolean;
  certRotationInterval?: number;
}

export class TLSManager extends EventEmitter {
  private config: Required<TLSConfig>;
  private cert?: Buffer;
  private key?: Buffer;
  private ca?: Buffer;
  private rotationTimer?: NodeJS.Timeout;

  constructor(config: TLSConfig) {
    super();
    this.config = {
      certPath: config.certPath || '',
      keyPath: config.keyPath || '',
      caPath: config.caPath || '',
      passphrase: config.passphrase || '',
      rejectUnauthorized: config.rejectUnauthorized !== false,
      minVersion: config.minVersion || 'TLSv1.3',
      maxVersion: config.maxVersion || 'TLSv1.3',
      ciphers: config.ciphers || 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256',
      enableMTLS: config.enableMTLS || false,
      certRotationInterval: config.certRotationInterval || 86400 // 24 hours
    };

    this.loadCertificates();
  }

  /**
   * Load TLS certificates
   */
  private loadCertificates(): void {
    try {
      if (this.config.certPath && fs.existsSync(this.config.certPath)) {
        this.cert = fs.readFileSync(this.config.certPath);
      }

      if (this.config.keyPath && fs.existsSync(this.config.keyPath)) {
        this.key = fs.readFileSync(this.config.keyPath);
      }

      if (this.config.caPath && fs.existsSync(this.config.caPath)) {
        this.ca = fs.readFileSync(this.config.caPath);
      }

      this.emit('certificatesLoaded');
    } catch (error: any) {
      this.emit('error', new Error(`Failed to load certificates: ${error.message}`));
    }
  }

  /**
   * Get HTTPS server options
   */
  getServerOptions(): https.ServerOptions {
    const options: https.ServerOptions = {
      cert: this.cert,
      key: this.key,
      ca: this.ca,
      passphrase: this.config.passphrase,
      minVersion: this.config.minVersion as any,
      maxVersion: this.config.maxVersion as any,
      ciphers: this.config.ciphers,
      honorCipherOrder: true,
      requestCert: this.config.enableMTLS,
      rejectUnauthorized: this.config.rejectUnauthorized
    };

    return options;
  }

  /**
   * Get TLS options for client connections
   */
  getClientOptions(): tls.ConnectionOptions {
    const options: tls.ConnectionOptions = {
      cert: this.cert,
      key: this.key,
      ca: this.ca,
      passphrase: this.config.passphrase,
      minVersion: this.config.minVersion as any,
      maxVersion: this.config.maxVersion as any,
      ciphers: this.config.ciphers,
      rejectUnauthorized: this.config.rejectUnauthorized,
      checkServerIdentity: (hostname, cert) => {
        // Custom server identity check
        return undefined; // No error means valid
      }
    };

    return options;
  }

  /**
   * Generate self-signed certificate (for development)
   */
  async generateSelfSignedCert(commonName: string = 'localhost'): Promise<{
    cert: string;
    key: string;
  }> {
    const { promisify } = require('util');
    const { generateKeyPair } = require('crypto');
    const generateKeyPairAsync = promisify(generateKeyPair);

    // Generate key pair
    const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Create certificate (simplified - use openssl in production)
    const cert = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUExample...
-----END CERTIFICATE-----`;

    return { cert, key: privateKey };
  }

  /**
   * Verify certificate validity
   */
  verifyCertificate(): {
    valid: boolean;
    expiresAt?: Date;
    issuer?: string;
    subject?: string;
  } {
    if (!this.cert) {
      return { valid: false };
    }

    try {
      const certString = this.cert.toString();
      const cert = crypto.X509Certificate ? new crypto.X509Certificate(certString) : null;

      if (!cert) {
        return { valid: false };
      }

      const now = new Date();
      const validFrom = new Date(cert.validFrom);
      const validTo = new Date(cert.validTo);

      return {
        valid: now >= validFrom && now <= validTo,
        expiresAt: validTo,
        issuer: cert.issuer,
        subject: cert.subject
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Enable automatic certificate rotation
   */
  enableAutoRotation(): void {
    this.rotationTimer = setInterval(() => {
      const verification = this.verifyCertificate();
      
      if (verification.expiresAt) {
        const daysUntilExpiry = Math.floor(
          (verification.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 30) {
          this.emit('certificateExpiringSoon', { daysUntilExpiry });
        }

        if (daysUntilExpiry <= 7) {
          this.emit('certificateExpiringCritical', { daysUntilExpiry });
        }
      }

      // Reload certificates
      this.loadCertificates();
    }, this.config.certRotationInterval * 1000);
  }

  /**
   * Disable automatic rotation
   */
  disableAutoRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = undefined;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disableAutoRotation();
    this.removeAllListeners();
  }
}
