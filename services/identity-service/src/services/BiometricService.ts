import axios from 'axios';
import { logger } from '../utils/logger';

export class BiometricService {
  private biometricServiceUrl: string;

  constructor() {
    this.biometricServiceUrl = process.env.BIOMETRIC_SERVICE_URL || 'http://localhost:8001';
  }

  async enrollBiometric(userId: string, biometricData: string, biometricType: string) {
    try {
      const response = await axios.post(`${this.biometricServiceUrl}/enroll/${biometricType.toLowerCase()}`, {
        user_id: userId,
        biometric_data: biometricData
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      return response.data;

    } catch (error) {
      logger.error('Biometric enrollment error:', error);
      return { success: false, error: 'Biometric enrollment failed' };
    }
  }

  async verifyBiometric(userId: string, biometricData: string, biometricType: string) {
    try {
      const response = await axios.post(`${this.biometricServiceUrl}/verify/${biometricType.toLowerCase()}`, {
        user_id: userId,
        biometric_data: biometricData
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      return response.data;

    } catch (error) {
      logger.error('Biometric verification error:', error);
      return { verified: false, confidence: 0 };
    }
  }
}
