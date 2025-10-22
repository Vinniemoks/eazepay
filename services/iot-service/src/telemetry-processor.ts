// Telemetry Processor - Processes device telemetry data
import { logger } from './utils/logger';

interface TelemetryData {
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
}

interface DeviceHealth {
  deviceId: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  batteryLevel?: number;
  signalStrength?: number;
  temperature?: number;
  uptime?: number;
  lastUpdate: Date;
  issues: string[];
}

export class TelemetryProcessor {
  private telemetryData: Map<string, TelemetryData[]> = new Map();
  private deviceHealth: Map<string, DeviceHealth> = new Map();

  processTelemetry(topic: string, message: any): void {
    try {
      // Extract device ID from topic: eazepay/devices/{deviceId}/telemetry
      const deviceId = topic.split('/')[2];
      
      const telemetry: TelemetryData = {
        deviceId,
        metric: message.metric,
        value: message.value,
        unit: message.unit || '',
        timestamp: new Date(message.timestamp || Date.now())
      };

      // Store telemetry
      if (!this.telemetryData.has(deviceId)) {
        this.telemetryData.set(deviceId, []);
      }
      
      const data = this.telemetryData.get(deviceId)!;
      data.push(telemetry);

      // Keep only last 1000 data points per device
      if (data.length > 1000) {
        data.shift();
      }

      logger.debug(`Telemetry received from ${deviceId}: ${telemetry.metric} = ${telemetry.value}`);
      
      // Update device health
      this.updateDeviceHealth(deviceId, telemetry);
      
      // Check for alerts
      this.checkAlerts(deviceId, telemetry);
      
    } catch (error) {
      logger.error('Error processing telemetry:', error);
    }
  }

  async getTelemetry(
    deviceId: string,
    metric?: string,
    startTime?: string,
    endTime?: string
  ): Promise<TelemetryData[]> {
    let data = this.telemetryData.get(deviceId) || [];

    if (metric) {
      data = data.filter(d => d.metric === metric);
    }

    if (startTime) {
      const start = new Date(startTime);
      data = data.filter(d => d.timestamp >= start);
    }

    if (endTime) {
      const end = new Date(endTime);
      data = data.filter(d => d.timestamp <= end);
    }

    return data;
  }

  async getDeviceHealth(deviceId: string): Promise<DeviceHealth | null> {
    return this.deviceHealth.get(deviceId) || null;
  }

  private updateDeviceHealth(deviceId: string, telemetry: TelemetryData): void {
    let health = this.deviceHealth.get(deviceId);
    
    if (!health) {
      health = {
        deviceId,
        status: 'HEALTHY',
        lastUpdate: new Date(),
        issues: []
      };
      this.deviceHealth.set(deviceId, health);
    }

    // Update metrics
    switch (telemetry.metric) {
      case 'battery_level':
        health.batteryLevel = telemetry.value;
        break;
      case 'signal_strength':
        health.signalStrength = telemetry.value;
        break;
      case 'temperature':
        health.temperature = telemetry.value;
        break;
      case 'uptime':
        health.uptime = telemetry.value;
        break;
    }

    health.lastUpdate = telemetry.timestamp;

    // Assess health status
    health.issues = [];

    if (health.batteryLevel !== undefined && health.batteryLevel < 20) {
      health.issues.push('Low battery');
    }

    if (health.signalStrength !== undefined && health.signalStrength < 30) {
      health.issues.push('Weak signal');
    }

    if (health.temperature !== undefined && health.temperature > 60) {
      health.issues.push('High temperature');
    }

    // Determine overall status
    if (health.issues.length === 0) {
      health.status = 'HEALTHY';
    } else if (health.issues.length <= 2) {
      health.status = 'WARNING';
    } else {
      health.status = 'CRITICAL';
    }
  }

  private checkAlerts(deviceId: string, telemetry: TelemetryData): void {
    // Critical battery level
    if (telemetry.metric === 'battery_level' && telemetry.value < 10) {
      logger.warn(`🔋 ALERT: Device ${deviceId} has critical battery level: ${telemetry.value}%`);
      // TODO: Send alert to admin
    }

    // High temperature
    if (telemetry.metric === 'temperature' && telemetry.value > 70) {
      logger.warn(`🌡️ ALERT: Device ${deviceId} has high temperature: ${telemetry.value}°C`);
      // TODO: Send alert to admin
    }

    // Weak signal
    if (telemetry.metric === 'signal_strength' && telemetry.value < 20) {
      logger.warn(`📶 ALERT: Device ${deviceId} has weak signal: ${telemetry.value}%`);
      // TODO: Send alert to admin
    }
  }

  getHealthyDevicesCount(): number {
    return Array.from(this.deviceHealth.values()).filter(h => h.status === 'HEALTHY').length;
  }

  getWarningDevicesCount(): number {
    return Array.from(this.deviceHealth.values()).filter(h => h.status === 'WARNING').length;
  }

  getCriticalDevicesCount(): number {
    return Array.from(this.deviceHealth.values()).filter(h => h.status === 'CRITICAL').length;
  }
}
