import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { api } from '../config/api';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export interface BiometricAvailability {
  available: boolean;
  biometryType: 'TouchID' | 'FaceID' | 'Biometrics' | null;
  error?: string;
}

class BiometricService {
  /**
   * Check if biometric authentication is available on device
   */
  async isAvailable(): Promise<BiometricAvailability> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      return {
        available,
        biometryType: biometryType as any,
      };
    } catch (error: any) {
      return {
        available: false,
        biometryType: null,
        error: error.message,
      };
    }
  }

  /**
   * Authenticate user with biometrics (for login)
   */
  async authenticate(promptMessage: string = 'Authenticate'): Promise<boolean> {
    try {
      const { available } = await this.isAvailable();
      
      if (!available) {
        Alert.alert('Biometric Not Available', 'Please use password to login');
        return false;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  /**
   * Enable biometric login for user
   */
  async enableBiometricLogin(userId: string): Promise<boolean> {
    try {
      const { available } = await this.isAvailable();
      
      if (!available) {
        Alert.alert('Biometric Not Available', 'Your device does not support biometric authentication');
        return false;
      }

      // Create biometric keys
      const { publicKey } = await rnBiometrics.createKeys();

      // Save to backend
      await api.post('/user/biometric/enable', {
        userId,
        publicKey,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });

      // Save locally that biometric is enabled
      await AsyncStorage.setItem('biometricEnabled', 'true');
      await AsyncStorage.setItem('biometricUserId', userId);

      return true;
    } catch (error: any) {
      console.error('Enable biometric error:', error);
      Alert.alert('Error', 'Failed to enable biometric login');
      return false;
    }
  }

  /**
   * Disable biometric login
   */
  async disableBiometricLogin(): Promise<boolean> {
    try {
      // Delete keys
      await rnBiometrics.deleteKeys();

      // Remove from backend
      await api.post('/user/biometric/disable');

      // Clear local storage
      await AsyncStorage.multiRemove(['biometricEnabled', 'biometricUserId']);

      return true;
    } catch (error: any) {
      console.error('Disable biometric error:', error);
      return false;
    }
  }

  /**
   * Check if biometric login is enabled
   */
  async isBiometricLoginEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Login with biometrics
   */
  async loginWithBiometric(): Promise<{ success: boolean; userId?: string; token?: string }> {
    try {
      const isEnabled = await this.isBiometricLoginEnabled();
      
      if (!isEnabled) {
        return { success: false };
      }

      // Authenticate with biometric
      const authenticated = await this.authenticate('Login to EazePay');
      
      if (!authenticated) {
        return { success: false };
      }

      // Get user ID
      const userId = await AsyncStorage.getItem('biometricUserId');
      
      if (!userId) {
        return { success: false };
      }

      // Create signature
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Sign in to EazePay',
        payload: userId,
      });

      if (!success || !signature) {
        return { success: false };
      }

      // Verify with backend
      const response = await api.post('/auth/biometric-login', {
        userId,
        signature,
      });

      return {
        success: true,
        userId,
        token: response.data.token,
      };
    } catch (error: any) {
      console.error('Biometric login error:', error);
      return { success: false };
    }
  }

  /**
   * Enroll fingerprint (for payment biometrics)
   */
  async enrollFingerprint(fingerId: string, userId: string): Promise<boolean> {
    try {
      // Authenticate to capture fingerprint
      const authenticated = await this.authenticate(`Enroll ${fingerId}`);
      
      if (!authenticated) {
        return false;
      }

      // In production, you would capture actual biometric template
      // For now, we'll simulate with a signature
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: `Enroll ${fingerId}`,
        payload: `${userId}-${fingerId}`,
      });

      if (!success || !signature) {
        return false;
      }

      // Send to backend
      await api.post('/biometric/enroll', {
        userId,
        fingerId,
        template: signature, // In production, this would be actual biometric template
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });

      return true;
    } catch (error: any) {
      console.error('Enroll fingerprint error:', error);
      Alert.alert('Error', 'Failed to enroll fingerprint');
      return false;
    }
  }

  /**
   * Verify fingerprint for payment
   */
  async verifyForPayment(amount: number, currency: string): Promise<boolean> {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: `Pay ${currency} ${amount}`,
        payload: `payment-${amount}-${currency}-${Date.now()}`,
      });

      if (!success || !signature) {
        return false;
      }

      // Verify with backend
      const response = await api.post('/biometric/verify-payment', {
        signature,
        amount,
        currency,
      });

      return response.data.verified === true;
    } catch (error: any) {
      console.error('Verify payment error:', error);
      return false;
    }
  }

  /**
   * Get biometric type name for display
   */
  getBiometricTypeName(type: string | null): string {
    switch (type) {
      case 'TouchID':
        return 'Touch ID';
      case 'FaceID':
        return 'Face ID';
      case 'Biometrics':
        return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
      default:
        return 'Biometric';
    }
  }
}

export const biometricService = new BiometricService();
