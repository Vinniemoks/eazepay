// Device Registry - Manages IoT devices
import { logger } from './utils/logger';

interface Device {
  deviceId: string;
  deviceType: 'AGENT_PHONE' | 'POS_TERMINAL' | 'KIOSK' | 'SMART_WATCH';
  agentId?: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
  lastSeen: Date;
  metadata: any;
  registeredAt: Date;
}

export class DeviceRegistry {
  private devices: Map<string, Device> = new Map();

  async registerDevice(data: {
    deviceId: string;
    deviceType: string;
    agentId?: string;
    metadata?: any;
  }): Promise<Device> {
    const device: Device = {
      deviceId: data.deviceId,
      deviceType: data.deviceType as any,
      agentId: data.agentId,
      status: 'ONLINE',
      lastSeen: new Date(),
      metadata: data.metadata || {},
      registeredAt: new Date()
    };

    this.devices.set(device.deviceId, device);
    
    logger.info(`Device registered: ${device.deviceId} (${device.deviceType})`);
    
    // TODO: Save to database
    
    return device;
  }

  async getDevice(deviceId: string): Promise<Device | null> {
    return this.devices.get(deviceId) || null;
  }

  async getDevices(filters?: {
    type?: string;
    status?: string;
    agentId?: string;
  }): Promise<Device[]> {
    let devices = Array.from(this.devices.values());

    if (filters?.type) {
      devices = devices.filter(d => d.deviceType === filters.type);
    }

    if (filters?.status) {
      devices = devices.filter(d => d.status === filters.status);
    }

    if (filters?.agentId) {
      devices = devices.filter(d => d.agentId === filters.agentId);
    }

    return devices;
  }

  async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    const device = this.devices.get(deviceId);
    
    if (device) {
      device.status = status as any;
      device.lastSeen = new Date();
      
      logger.info(`Device ${deviceId} status updated to ${status}`);
      
      // TODO: Save to database
    }
  }

  processStatusUpdate(topic: string, message: any): void {
    try {
      // Extract device ID from topic: eazepay/devices/{deviceId}/status
      const deviceId = topic.split('/')[2];
      
      this.updateDeviceStatus(deviceId, message.status);
    } catch (error) {
      logger.error('Error processing status update:', error);
    }
  }

  getDeviceCount(): number {
    return this.devices.size;
  }

  getOnlineDevices(): Device[] {
    return Array.from(this.devices.values()).filter(d => d.status === 'ONLINE');
  }
}
