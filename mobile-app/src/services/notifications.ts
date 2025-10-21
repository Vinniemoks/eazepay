import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { apiClient } from '../config/api';

class NotificationService {
  async initialize() {
    // Configure local notifications
    PushNotification.configure({
      onNotification: notification => {
        console.log('Notification:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Request Firebase permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await this.registerDevice();
      this.setupMessageHandlers();
    }
  }

  private async registerDevice() {
    try {
      const token = await messaging().getToken();
      await apiClient.post('/api/notifications/register', {
        token,
        platform: 'mobile',
      });
      console.log('Device registered for notifications');
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  private setupMessageHandlers() {
    // Foreground messages
    messaging().onMessage(async remoteMessage => {
      this.showLocalNotification(remoteMessage);
    });

    // Background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
    });

    // Notification opened app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      // Navigate to relevant screen
    });

    // Check if app was opened from notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
        }
      });
  }

  private showLocalNotification(message: any) {
    PushNotification.localNotification({
      title: message.notification?.title || 'Eazepay',
      message: message.notification?.body || '',
      playSound: true,
      soundName: 'default',
      data: message.data,
    });
  }

  async showTransactionNotification(type: 'sent' | 'received', amount: number) {
    const title = type === 'sent' ? 'Money Sent' : 'Money Received';
    const message = `KES ${amount.toFixed(2)}`;

    PushNotification.localNotification({
      title,
      message,
      playSound: true,
      soundName: 'default',
    });
  }
}

export const notificationService = new NotificationService();
