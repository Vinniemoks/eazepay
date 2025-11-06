import { body, param, query } from 'express-validator';

export const validateDeviceRegistration = [
  body('deviceId').isString().notEmpty(),
  body('type').isString().notEmpty(),
  body('model').isString().notEmpty(),
];

export const validateDeviceStatusUpdate = [
  param('deviceId').isString().notEmpty(),
  body('status').isString().notEmpty(),
];

export const validateLocationHistory = [
  param('agentId').isString().notEmpty(),
  query('startTime').isISO8601().toDate(),
  query('endTime').isISO8601().toDate(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
];

export const validateNearbyAgents = [
  query('latitude').isFloat(),
  query('longitude').isFloat(),
  query('radius').optional().isFloat({ min: 1 }),
];

export const validateTelemetry = [
  param('deviceId').isString().notEmpty(),
  query('metric').isString().notEmpty(),
  query('startTime').isISO8601().toDate(),
  query('endTime').isISO8601().toDate(),
];