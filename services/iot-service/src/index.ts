// IoT Service - Main Entry Point
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { MQTTBroker } from './mqtt-broker';
import { DeviceRegistry } from './device-registry';
import { TelemetryProcessor } from './telemetry-processor';
import { LocationTracker } from './location-tracker';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8030;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
const mqttBroker = new MQTTBroker();
const deviceRegistry = new DeviceRegistry();
const telemetryProcessor = new TelemetryProcessor();
const locationTracker = new LocationTracker();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'iot-service',
    timestamp: new Date().toISOString(),
    mqtt: mqttBroker.isConnected(),
    devices: deviceRegistry.getDeviceCount()
  });
});

// Device Management Endpoints

// Register new device
app.post('/api/devices/register', async (req: Request, res: Response) => {
  try {
    const { deviceId, deviceType, agentId, metadata } = req.body;
    
    const device = await deviceRegistry.registerDevice({
      deviceId,
      deviceType,
      agentId,
      metadata
    });
    
    res.json({
      success: true,
      device,
      message: 'Device registered successfully'
    });
  } catch (error: any) {
    logger.error('Device registration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get device info
app.get('/api/devices/:deviceId', async (req: Request, res: Response) => {
  try {
    const device = await deviceRegistry.getDevice(req.params.deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    res.json({
      success: true,
      device
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all devices
app.get('/api/devices', async (req: Request, res: Response) => {
  try {
    const { type, status, agentId } = req.query;
    
    const devices = await deviceRegistry.getDevices({
      type: type as string,
      status: status as string,
      agentId: agentId as string
    });
    
    res.json({
      success: true,
      count: devices.length,
      devices
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update device status
app.put('/api/devices/:deviceId/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    await deviceRegistry.updateDeviceStatus(req.params.deviceId, status);
    
    res.json({
      success: true,
      message: 'Device status updated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Location Tracking Endpoints

// Get agent location
app.get('/api/agents/:agentId/location', async (req: Request, res: Response) => {
  try {
    const location = await locationTracker.getAgentLocation(req.params.agentId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      location
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get location history
app.get('/api/agents/:agentId/location/history', async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, limit } = req.query;
    
    const history = await locationTracker.getLocationHistory(
      req.params.agentId,
      startTime as string,
      endTime as string,
      parseInt(limit as string) || 100
    );
    
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get nearby agents
app.get('/api/agents/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    const agents = await locationTracker.getNearbyAgents(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string) || 5000 // 5km default
    );
    
    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Telemetry Endpoints

// Get device telemetry
app.get('/api/devices/:deviceId/telemetry', async (req: Request, res: Response) => {
  try {
    const { metric, startTime, endTime } = req.query;
    
    const telemetry = await telemetryProcessor.getTelemetry(
      req.params.deviceId,
      metric as string,
      startTime as string,
      endTime as string
    );
    
    res.json({
      success: true,
      telemetry
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get device health
app.get('/api/devices/:deviceId/health', async (req: Request, res: Response) => {
  try {
    const health = await telemetryProcessor.getDeviceHealth(req.params.deviceId);
    
    res.json({
      success: true,
      health
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    // Connect to MQTT broker
    await mqttBroker.connect();
    
    // Subscribe to device topics
    mqttBroker.subscribe('eazepay/agents/+/location', (topic, message) => {
      locationTracker.processLocationUpdate(topic, message);
    });
    
    mqttBroker.subscribe('eazepay/devices/+/telemetry', (topic, message) => {
      telemetryProcessor.processTelemetry(topic, message);
    });
    
    mqttBroker.subscribe('eazepay/devices/+/status', (topic, message) => {
      deviceRegistry.processStatusUpdate(topic, message);
    });
    
    app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   📡 Eazepay IoT Service                             ║
║                                                       ║
║   Version: 1.0.0                                     ║
║   Port: ${PORT}                                        ║
║   MQTT: Connected ✅                                  ║
║                                                       ║
║   Endpoints:                                         ║
║   Device Management:                                 ║
║   - POST /api/devices/register                       ║
║   - GET  /api/devices/:id                            ║
║   - GET  /api/devices                                ║
║   - PUT  /api/devices/:id/status                     ║
║                                                       ║
║   Location Tracking:                                 ║
║   - GET  /api/agents/:id/location                    ║
║   - GET  /api/agents/:id/location/history            ║
║   - GET  /api/agents/nearby                          ║
║                                                       ║
║   Telemetry:                                         ║
║   - GET  /api/devices/:id/telemetry                  ║
║   - GET  /api/devices/:id/health                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start IoT service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await mqttBroker.disconnect();
  process.exit(0);
});

startServer();

export default app;
