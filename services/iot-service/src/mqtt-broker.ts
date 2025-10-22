// MQTT Broker Client
import mqtt, { MqttClient } from 'mqtt';
import { logger } from './utils/logger';

export class MQTTBroker {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  private messageHandlers: Map<string, (topic: string, message: any) => void> = new Map();

  async connect(): Promise<void> {
    try {
      const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
      
      this.client = mqtt.connect(brokerUrl, {
        clientId: `iot-service-${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
      });

      return new Promise((resolve, reject) => {
        this.client!.on('connect', () => {
          logger.info('✅ Connected to MQTT broker');
          this.connected = true;
          resolve();
        });

        this.client!.on('error', (error) => {
          logger.error('MQTT connection error:', error);
          this.connected = false;
          reject(error);
        });

        this.client!.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

        this.client!.on('offline', () => {
          logger.warn('MQTT client offline');
          this.connected = false;
        });

        this.client!.on('reconnect', () => {
          logger.info('Reconnecting to MQTT broker...');
        });
      });
    } catch (error) {
      logger.error('Failed to connect to MQTT broker:', error);
      throw error;
    }
  }

  subscribe(topic: string, handler: (topic: string, message: any) => void): void {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }

    this.client.subscribe(topic, (error) => {
      if (error) {
        logger.error(`Failed to subscribe to ${topic}:`, error);
      } else {
        logger.info(`📥 Subscribed to topic: ${topic}`);
        this.messageHandlers.set(topic, handler);
      }
    });
  }

  publish(topic: string, message: any): void {
    if (!this.client) {
      throw new Error('MQTT client not connected');
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        logger.error(`Failed to publish to ${topic}:`, error);
      } else {
        logger.debug(`📤 Published to ${topic}`);
      }
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const payload = JSON.parse(message.toString());
      
      // Find matching handler (supports wildcards)
      for (const [pattern, handler] of this.messageHandlers.entries()) {
        if (this.topicMatches(topic, pattern)) {
          handler(topic, payload);
        }
      }
    } catch (error) {
      logger.error('Error handling MQTT message:', error);
    }
  }

  private topicMatches(topic: string, pattern: string): boolean {
    const topicParts = topic.split('/');
    const patternParts = pattern.split('/');

    if (patternParts.length !== topicParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '+') {
        continue; // Single-level wildcard
      }
      if (patternParts[i] === '#') {
        return true; // Multi-level wildcard
      }
      if (patternParts[i] !== topicParts[i]) {
        return false;
      }
    }

    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          logger.info('Disconnected from MQTT broker');
          this.connected = false;
          resolve();
        });
      });
    }
  }
}
