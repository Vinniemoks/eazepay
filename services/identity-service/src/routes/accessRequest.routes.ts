// Access Request routes
// Phase 4: Access Request Workflow

import { Router } from 'express';
import { AccessRequestController } from '../controllers/AccessRequestController';
import { authenticate, requireSuperuser, requireManager } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const controller = new AccessRequestController();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createRequestSchema = Joi.object({
  targetUserId: Joi.string().uuid().required(),
  requestedPermissions: Joi.array().items(Joi.string()).min(1).required(),
  justification: Joi.string().min(50).max(1000).required(),
  urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional()
});

const reviewRequestSchema = Joi.object({
  reason: Joi.string().min(10).max(500).optional()
});

const rejectRequestSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required()
});

const emergencyAccessSchema = Joi.object({
  targetUserId: Joi.string().uuid().required(),
  permissions: Joi.array().items(Joi.string()).min(1).required(),
  justification: Joi.string().min(50).max(1000).required()
});

// Create access request (managers only)
router.post('/', requireManager, validateRequest(createRequestSchema), controller.createAccessRequest);

// Get pending requests (superusers only)
router.get('/pending', requireSuperuser, controller.getPendingRequests);

// Get request details
router.get('/:requestId', controller.getRequestDetails);

// Approve request (superusers only)
router.post('/:requestId/approve', requireSuperuser, validateRequest(reviewRequestSchema), controller.approveRequest);

// Reject request (superusers only)
router.post('/:requestId/reject', requireSuperuser, validateRequest(rejectRequestSchema), controller.rejectRequest);

// Get my submitted requests
router.get('/my/requests', controller.getMyRequests);

// Get requests for specific user
router.get('/user/:userId', controller.getRequestsForUser);

// Emergency break-glass access (superusers only)
router.post('/emergency-access', requireSuperuser, validateRequest(emergencyAccessSchema), controller.grantEmergencyAccess);

export default router;
