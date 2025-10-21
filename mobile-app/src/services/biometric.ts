import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true,
    });
  }

  async isAvailable(): Promise<{ available: boolean; biometryType: string }> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return {
        available,
        biometryType: biometryType || 'none',
      };
    } catch (error) {
      console.error('Biometric check failed:', error);
      return { available: false, biometryType: 'none' };
    }
  }

  async authenticate(reason: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async createKeys(): Promise<boolean> {
    try {
      const { publicKey } = await this.rnBiometrics.createKeys();
      return !!publicKey;
    } catch (error) {
      console.error('Key creation failed:', error);
      return false;
    }
  }

  async createSignature(payload: string): Promise<string | null> {
    try {
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: 'Sign transaction',
        payload,
        cancelButtonText: 'Cancel',
      });

      return success ? signature : null;
    } catch (error) {
      console.error('Signature creation failed:', error);
      return null;
    }
  }

  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Key deletion failed:', error);
      return false;
    }
  }
}

export const biometricService = new BiometricService();
