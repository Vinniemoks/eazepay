import { query, pool } from '../config/database';
import { BiometricMatcher, BiometricFeatures } from '../services/BiometricMatcher';
import crypto from 'crypto';

export interface BiometricTemplate {
  id: string;
  userId: string;
  biometricType: 'fingerprint' | 'palm' | 'face';
  fingerType?: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';
  hand?: 'left' | 'right';
  templateData: string;
  templateHash: string;
  isPrimary: boolean;
  qualityScore: number;
  enrolledAt: Date;
  lastUsedAt?: Date;
}

export class BiometricTemplateModel {
  private static matcher = new BiometricMatcher();

  /**
   * Enroll a new biometric template
   */
  static async enroll(
    userId: string,
    biometricType: string,
    rawBiometricData: Buffer,
    fingerType?: string,
    hand?: string,
    isPrimary: boolean = false
  ): Promise<BiometricTemplate> {
    // Extract features
    const features = this.matcher.extractFeatures(rawBiometricData);
    
    // Check quality
    if (features.quality < 0.5) {
      throw new Error('Biometric quality too low. Please try again.');
    }

    // Generate hash for duplicate detection
    const templateHash = this.matcher.generateHash(features);

    // Check for duplicates
    const duplicate = await this.checkDuplicate(templateHash, userId);
    if (duplicate) {
      throw new Error('This biometric is already enrolled by another user');
    }

    // Encrypt template data
    const templateData = this.encryptTemplate(features);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If this is primary, unset other primary templates
      if (isPrimary) {
        await client.query(
          'UPDATE biometric_templates SET is_primary = FALSE WHERE user_id = $1',
          [userId]
        );
      }

      // Insert template
      const result = await client.query(
        `INSERT INTO biometric_templates 
         (user_id, biometric_type, finger_type, hand, template_data, template_hash, is_primary, quality_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [userId, biometricType, fingerType, hand, templateData, templateHash, isPrimary, features.quality]
      );

      // Store hash for duplicate detection
      await client.query(
        'INSERT INTO biometric_hashes (user_id, template_hash, biometric_type) VALUES ($1, $2, $3)',
        [userId, templateHash, biometricType]
      );

      await client.query('COMMIT');

      return this.mapToTemplate(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify biometric against enrolled templates
   */
  static async verify(
    rawBiometricData: Buffer,
    userId?: string,
    transactionId?: string
  ): Promise<{
    success: boolean;
    userId?: string;
    matchScore: number;
    templateId?: string;
  }> {
    // Extract features from captured biometric
    const capturedFeatures = this.matcher.extractFeatures(rawBiometricData);

    // Check quality
    if (capturedFeatures.quality < 0.5) {
      throw new Error('Biometric quality too low. Please try again.');
    }

    // Get templates to compare against
    let templates: BiometricTemplate[];
    if (userId) {
      templates = await this.getByUserId(userId);
    } else {
      // Search all templates (slower, but needed for 1:N matching)
      templates = await this.getAllTemplates();
    }

    let bestMatch = 0;
    let matchedTemplate: BiometricTemplate | null = null;

    // Compare against each template
    for (const template of templates) {
      const storedFeatures = this.decryptTemplate(template.templateData);
      const matchScore = this.matcher.compareTemplates(capturedFeatures, storedFeatures);

      if (matchScore > bestMatch) {
        bestMatch = matchScore;
        matchedTemplate = template;
      }
    }

    const success = this.matcher.isMatch(bestMatch);

    // Log verification attempt
    await this.logVerificationAttempt(
      matchedTemplate?.userId,
      transactionId,
      bestMatch,
      success,
      matchedTemplate?.id
    );

    // Update last used timestamp
    if (success && matchedTemplate) {
      await this.updateLastUsed(matchedTemplate.id);
    }

    return {
      success,
      userId: matchedTemplate?.userId,
      matchScore: bestMatch,
      templateId: matchedTemplate?.id
    };
  }

  /**
   * Get all templates for a user
   */
  static async getByUserId(userId: string): Promise<BiometricTemplate[]> {
    const result = await query(
      'SELECT * FROM biometric_templates WHERE user_id = $1 ORDER BY is_primary DESC, enrolled_at ASC',
      [userId]
    );
    return result.rows.map(this.mapToTemplate);
  }

  /**
   * Get primary template for a user
   */
  static async getPrimaryTemplate(userId: string): Promise<BiometricTemplate | null> {
    const result = await query(
      'SELECT * FROM biometric_templates WHERE user_id = $1 AND is_primary = TRUE LIMIT 1',
      [userId]
    );
    return result.rows[0] ? this.mapToTemplate(result.rows[0]) : null;
  }

  /**
   * Delete a template
   */
  static async delete(templateId: string): Promise<void> {
    await query('DELETE FROM biometric_templates WHERE id = $1', [templateId]);
  }

  /**
   * Get enrollment count for user
   */
  static async getEnrollmentCount(userId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM biometric_templates WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  // Private helper methods

  private static async checkDuplicate(templateHash: string, userId: string): Promise<boolean> {
    const result = await query(
      'SELECT user_id FROM biometric_hashes WHERE template_hash = $1 AND user_id != $2',
      [templateHash, userId]
    );
    return result.rows.length > 0;
  }

  private static async getAllTemplates(): Promise<BiometricTemplate[]> {
    const result = await query('SELECT * FROM biometric_templates ORDER BY is_primary DESC');
    return result.rows.map(this.mapToTemplate);
  }

  private static async logVerificationAttempt(
    userId: string | undefined,
    transactionId: string | undefined,
    matchScore: number,
    success: boolean,
    templateId: string | undefined
  ): Promise<void> {
    await query(
      `INSERT INTO verification_attempts 
       (user_id, transaction_id, match_score, success, matched_template_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, transactionId || null, matchScore, success, templateId || null]
    );
  }

  private static async updateLastUsed(templateId: string): Promise<void> {
    await query(
      'UPDATE biometric_templates SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [templateId]
    );
  }

  private static encryptTemplate(features: BiometricFeatures): string {
    // In production, use proper encryption (AES-256-GCM)
    // For now, just base64 encode
    return Buffer.from(JSON.stringify(features)).toString('base64');
  }

  private static decryptTemplate(templateData: string): BiometricFeatures {
    // In production, use proper decryption
    return JSON.parse(Buffer.from(templateData, 'base64').toString());
  }

  private static mapToTemplate(row: any): BiometricTemplate {
    return {
      id: row.id,
      userId: row.user_id,
      biometricType: row.biometric_type,
      fingerType: row.finger_type,
      hand: row.hand,
      templateData: row.template_data,
      templateHash: row.template_hash,
      isPrimary: row.is_primary,
      qualityScore: parseFloat(row.quality_score),
      enrolledAt: row.enrolled_at,
      lastUsedAt: row.last_used_at
    };
  }
}
