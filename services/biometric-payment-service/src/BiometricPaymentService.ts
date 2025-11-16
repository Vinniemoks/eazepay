import crypto from 'crypto';
import { DataEncryption } from '../../shared/security/src/encryption/DataEncryption';

export interface BiometricTemplate {
  userId: string;
  fingerType: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  hand: 'left' | 'right';
  templateData: string; // Encrypted biometric template
  isPrimary: boolean;
  enrolledAt: Date;
  lastUsedAt?: Date;
}

export interface PalmTemplate {
  userId: string;
  hand: 'left' | 'right';
  templateData: string; // Encrypted palm print
  enrolledAt: Date;
  lastUsedAt?: Date;
}

export interface PaymentAuthorization {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  merchantId: string;
  biometricMatch: boolean;
  matchScore: number;
  timestamp: Date;
}

export class BiometricPaymentService {
  private encryption: DataEncryption;
  private matchThreshold: number = 0.85; // 85% match required

  constructor(encryptionKey: string) {
    this.encryption = new DataEncryption(encryptionKey);
  }

  /**
   * Enroll a fingerprint for payment authorization
   */
  async enrollFingerprint(
    userId: string,
    fingerType: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky',
    hand: 'left' | 'right',
    rawBiometricData: Buffer,
    isPrimary: boolean = false
  ): Promise<BiometricTemplate> {
    // Extract biometric features (in production, use proper biometric SDK)
    const template = this.extractBiometricFeatures(rawBiometricData);
    
    // Encrypt the template
    const encryptedTemplate = this.encryption.encrypt(JSON.stringify(template));
    
    return {
      userId,
      fingerType,
      hand,
      templateData: encryptedTemplate,
      isPrimary,
      enrolledAt: new Date()
    };
  }

  /**
   * Enroll palm print for payment authorization
   */
  async enrollPalm(
    userId: string,
    hand: 'left' | 'right',
    rawPalmData: Buffer
  ): Promise<PalmTemplate> {
    // Extract palm features
    const template = this.extractPalmFeatures(rawPalmData);
    
    // Encrypt the template
    const encryptedTemplate = this.encryption.encrypt(JSON.stringify(template));
    
    return {
      userId,
      hand,
      templateData: encryptedTemplate,
      enrolledAt: new Date()
    };
  }

  /**
   * Authorize payment using single fingerprint
   */
  async authorizePayment(
    transactionId: string,
    amount: number,
    currency: string,
    merchantId: string,
    capturedBiometric: Buffer,
    enrolledTemplates: BiometricTemplate[]
  ): Promise<PaymentAuthorization> {
    // Extract features from captured biometric
    const capturedFeatures = this.extractBiometricFeatures(capturedBiometric);
    
    let bestMatch = 0;
    let matchedUserId: string | null = null;

    // Compare against all enrolled templates
    for (const template of enrolledTemplates) {
      const decryptedTemplate = JSON.parse(
        this.encryption.decrypt(template.templateData)
      );
      
      const matchScore = this.compareBiometrics(capturedFeatures, decryptedTemplate);
      
      if (matchScore > bestMatch) {
        bestMatch = matchScore;
        matchedUserId = template.userId;
      }
    }

    const authorized = bestMatch >= this.matchThreshold && matchedUserId !== null;

    return {
      transactionId,
      userId: matchedUserId || '',
      amount,
      currency,
      merchantId,
      biometricMatch: authorized,
      matchScore: bestMatch,
      timestamp: new Date()
    };
  }

  /**
   * Extract biometric features (simplified - use proper SDK in production)
   */
  private extractBiometricFeatures(rawData: Buffer): any {
    // In production, use proper biometric SDK like:
    // - Neurotechnology MegaMatcher
    // - Innovatrics ABIS
    // - Aware AFIX
    
    // Simplified feature extraction
    const hash = crypto.createHash('sha256').update(rawData).digest();
    
    return {
      minutiae: this.extractMinutiae(hash),
      ridgePattern: this.extractRidgePattern(hash),
      quality: this.assessQuality(rawData)
    };
  }

  /**
   * Extract palm features
   */
  private extractPalmFeatures(rawData: Buffer): any {
    const hash = crypto.createHash('sha256').update(rawData).digest();
    
    return {
      principalLines: this.extractPrincipalLines(hash),
      wrinkles: this.extractWrinkles(hash),
      ridgePattern: this.extractRidgePattern(hash),
      quality: this.assessQuality(rawData)
    };
  }

  /**
   * Compare two biometric templates
   */
  private compareBiometrics(template1: any, template2: any): number {
    // Simplified comparison - use proper biometric matching in production
    const minutiaeScore = this.compareMinutiae(template1.minutiae, template2.minutiae);
    const ridgeScore = this.compareRidgePattern(template1.ridgePattern, template2.ridgePattern);
    
    // Weighted average
    return (minutiaeScore * 0.7) + (ridgeScore * 0.3);
  }

  // Simplified feature extraction methods (replace with proper SDK)
  private extractMinutiae(hash: Buffer): any[] {
    const minutiae = [];
    for (let i = 0; i < Math.min(20, hash.length); i += 2) {
      minutiae.push({
        x: hash[i],
        y: hash[i + 1],
        angle: (hash[i] + hash[i + 1]) % 360,
        type: hash[i] % 2 === 0 ? 'ridge_ending' : 'bifurcation'
      });
    }
    return minutiae;
  }

  private extractRidgePattern(hash: Buffer): any {
    return {
      type: ['loop', 'whorl', 'arch'][hash[0] % 3],
      density: hash[1] / 255,
      flow: hash.slice(2, 10).toString('hex')
    };
  }

  private extractPrincipalLines(hash: Buffer): any[] {
    return [
      { type: 'heart', points: hash.slice(0, 4) },
      { type: 'head', points: hash.slice(4, 8) },
      { type: 'life', points: hash.slice(8, 12) }
    ];
  }

  private extractWrinkles(hash: Buffer): any[] {
    const wrinkles = [];
    for (let i = 0; i < 10; i++) {
      wrinkles.push({
        position: hash[i * 2],
        depth: hash[i * 2 + 1] / 255
      });
    }
    return wrinkles;
  }

  private compareMinutiae(m1: any[], m2: any[]): number {
    let matches = 0;
    const threshold = 10; // pixels

    for (const point1 of m1) {
      for (const point2 of m2) {
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + 
          Math.pow(point1.y - point2.y, 2)
        );
        
        if (distance < threshold && point1.type === point2.type) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(m1.length, m2.length);
  }

  private compareRidgePattern(r1: any, r2: any): number {
    if (r1.type !== r2.type) return 0;
    
    const densityDiff = Math.abs(r1.density - r2.density);
    return 1 - densityDiff;
  }

  private assessQuality(rawData: Buffer): number {
    // Simplified quality assessment
    const variance = this.calculateVariance(rawData);
    return Math.min(1, variance / 1000);
  }

  private calculateVariance(data: Buffer): number {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
  }
}
