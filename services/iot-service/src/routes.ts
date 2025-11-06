import { Router } from 'express';
import { authenticate, requirePermission } from './middleware/auth';
import { deviceRegistry, locationTracker, telemetryProcessor } from './services';
import { asyncHandler } from './utils/handler';
import { ApiError } from './utils/error';
import {
  validateDeviceRegistration,
  validateDeviceStatusUpdate,
  validateLocationHistory,
  validateNearbyAgents,
  validateTelemetry,
} from './middleware/validators';

const router = Router();

// Device Management Endpoints
router.post(
  '/devices/register',
  authenticate,
  requirePermission('IOT-DEVICES-CREATE'),
  validateDeviceRegistration,
  asyncHandler(async (req, res) => {
    const device = await deviceRegistry.registerDevice(req.body);
    res.json({ success: true, device, message: 'Device registered successfully' });
  })
);

router.get(
  '/devices/:deviceId',
  authenticate,
  requirePermission('IOT-DEVICES-VIEW'),
  asyncHandler(async (req, res) => {
    const device = await deviceRegistry.getDevice(req.params.deviceId);
    if (!device) {
      throw ApiError.notFound('Device not found');
    }
    res.json({ success: true, device });
  })
);

router.get(
  '/devices',
  authenticate,
  requirePermission('IOT-DEVICES-VIEW'),
  asyncHandler(async (req, res) => {
    const devices = await deviceRegistry.getDevices(req.query as any);
    res.json({ success: true, count: devices.length, devices });
  })
);

router.put(
  '/devices/:deviceId/status',
  authenticate,
  requirePermission('IOT-DEVICES-UPDATE'),
  validateDeviceStatusUpdate,
  asyncHandler(async (req, res) => {
    await deviceRegistry.updateDeviceStatus(req.params.deviceId, req.body.status);
    res.json({ success: true, message: 'Device status updated' });
  })
);

// Location Tracking Endpoints
router.get(
  '/agents/:agentId/location',
  authenticate,
  requirePermission('IOT-LOCATION-VIEW'),
  asyncHandler(async (req, res) => {
    const location = await locationTracker.getAgentLocation(req.params.agentId);
    if (!location) {
      throw ApiError.notFound('Location not found');
    }
    res.json({ success: true, location });
  })
);

router.get(
  '/agents/:agentId/location/history',
  authenticate,
  requirePermission('IOT-LOCATION-VIEW'),
  validateLocationHistory,
  asyncHandler(async (req, res) => {
    const { startTime, endTime, limit } = req.query;
    const history = await locationTracker.getLocationHistory(
      req.params.agentId,
      startTime as string,
      endTime as string,
      parseInt(limit as string) || 100
    );
    res.json({ success: true, count: history.length, history });
  })
);

router.get(
  '/agents/nearby',
  authenticate,
  requirePermission('IOT-LOCATION-VIEW'),
  validateNearbyAgents,
  asyncHandler(async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    const agents = await locationTracker.getNearbyAgents(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string) || 5000
    );
    res.json({ success: true, count: agents.length, agents });
  })
);

// Telemetry Endpoints
router.get(
  '/telemetry',
  authenticate,
  validateTelemetry,
  asyncHandler(async (req, res) => {
    const { metric, startTime, endTime } = req.query;
    const telemetry = await telemetryProcessor.getTelemetry(
      req.params.deviceId,
      metric as string,
      startTime as string,
      endTime as string
    );
    res.json({ success: true, telemetry });
  })
);

router.get(
  '/devices/:deviceId/health',
  authenticate,
  requirePermission('IOT-TELEMETRY-VIEW'),
  asyncHandler(async (req, res) => {
    const health = await telemetryProcessor.getDeviceHealth(req.params.deviceId);
    res.json({ success: true, health });
  })
);

export default router;