import crypto from 'crypto';

export interface BiometricFeatures {
  minutiae: Minutia[];
  ridgePattern: RidgePattern;
  quality: number;
}

export interface Minutia {
  x: number;
  y: number;
  angle: number;
  type: 'ridge_ending' | 'bifurcation';
}

export interface RidgePattern {
  type: 'loop' | 'whorl' | 'arch';
  density: number;
  flow: string;
}

export class BiometricMatcher {
  private matchThreshold: number = 0.85; // 85% match required

  /**
   * Extract biometric features from raw data
   * In production, use proper biometric SDK like:
   * - Neurotechnology MegaMatcher
   * - Innovatrics ABIS
   * - Aware AFIX
   */
  extractFeatures(rawData: Buffer): BiometricFeatures {
    // Generate hash for feature extraction
    const hash = crypto.createHash('sha256').update(rawData).digest();
    
    return {
      minutiae: this.extractMinutiae(hash),
      ridgePattern: this.extractRidgePattern(hash),
      quality: this.assessQuality(rawData)
    };
  }

  /**
   * Compare two biometric templates
   * Returns match score between 0 and 1
   */
  compareTemplates(template1: BiometricFeatures, template2: BiometricFeatures): number {
    // Quality check
    if (template1.quality < 0.5 || template2.quality < 0.5) {
      return 0; // Poor quality, reject
    }

    // Compare minutiae (70% weight)
    const minutiaeScore = this.compareMinutiae(template1.minutiae, template2.minutiae);
    
    // Compare ridge pattern (30% weight)
    const ridgeScore = this.compareRidgePattern(template1.ridgePattern, template2.ridgePattern);
    
    // Weighted average
    return (minutiaeScore * 0.7) + (ridgeScore * 0.3);
  }

  /**
   * Generate hash for duplicate detection
   */
  generateHash(features: BiometricFeatures): string {
    const data = JSON.stringify({
      minutiae: features.minutiae.slice(0, 10), // First 10 minutiae
      ridgeType: features.ridgePattern.type
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check if match score meets threshold
   */
  isMatch(score: number): boolean {
    return score >= this.matchThreshold;
  }

  // Private helper methods

  private extractMinutiae(hash: Buffer): Minutia[] {
    const minutiae: Minutia[] = [];
    const count = Math.min(20, Math.floor(hash.length / 3));
    
    for (let i = 0; i < count; i++) {
      const offset = i * 3;
      minutiae.push({
        x: hash[offset] * 2,
        y: hash[offset + 1] * 2,
        angle: (hash[offset + 2] * 360) / 255,
        type: hash[offset] % 2 === 0 ? 'ridge_ending' : 'bifurcation'
      });
    }
    
    return minutiae;
  }

  private extractRidgePattern(hash: Buffer): RidgePattern {
    const types: ('loop' | 'whorl' | 'arch')[] = ['loop', 'whorl', 'arch'];
    return {
      type: types[hash[0] % 3],
      density: hash[1] / 255,
      flow: hash.slice(2, 10).toString('hex')
    };
  }

  private assessQuality(rawData: Buffer): number {
    // Simplified quality assessment
    // In production, use proper quality metrics:
    // - NFIQ (NIST Fingerprint Image Quality)
    // - ISO/IEC 29794-1
    
    if (rawData.length < 1000) return 0.3; // Too small
    if (rawData.length > 100000) return 0.9; // Good size
    
    const variance = this.calculateVariance(rawData);
    return Math.min(1, variance / 1000);
  }

  private calculateVariance(data: Buffer): number {
    const sample = data.slice(0, 1000); // Sample first 1000 bytes
    const mean = sample.reduce((sum, val) => sum + val, 0) / sample.length;
    const variance = sample.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sample.length;
    return variance;
  }

  private compareMinutiae(m1: Minutia[], m2: Minutia[]): number {
    if (m1.length === 0 || m2.length === 0) return 0;
    
    let matches = 0;
    const threshold = 15; // pixels tolerance
    const angleThreshold = 30; // degrees tolerance

    for (const point1 of m1) {
      for (const point2 of m2) {
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + 
          Math.pow(point1.y - point2.y, 2)
        );
        
        const angleDiff = Math.abs(point1.angle - point2.angle);
        
        if (distance < threshold && 
            angleDiff < angleThreshold && 
            point1.type === point2.type) {
          matches++;
          break;
        }
      }
    }

    return matches / Math.max(m1.length, m2.length);
  }

  private compareRidgePattern(r1: RidgePattern, r2: RidgePattern): number {
    // Type must match
    if (r1.type !== r2.type) return 0;
    
    // Compare density
    const densityDiff = Math.abs(r1.density - r2.density);
    const densityScore = 1 - densityDiff;
    
    // Compare flow pattern (simplified)
    const flowScore = r1.flow === r2.flow ? 1 : 0.5;
    
    return (densityScore * 0.6) + (flowScore * 0.4);
  }
}
