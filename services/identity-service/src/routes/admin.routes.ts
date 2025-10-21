// Admin routes
// Phase 3: Admin Service & Organizational Management

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { PermissionController } from '../controllers/PermissionController';
import { authenticate, requireSuperuser, requirePermission, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = Router();
const adminController = new AdminController();
const permissionController = new PermissionController();

// All admin routes require authentication
router.use(authenticate);

// Validation schemas
const createAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).max(255).required(),
  role: Joi.string().valid('MANAGER', 'EMPLOYEE').required(),
  department: Joi.string().valid('FINANCE', 'OPERATIONS', 'CUSTOMER_SUPPORT', 'COMPLIANCE', 'IT', 'MANAGEMENT').required(),
  permissions: Joi.array().items(Joi.string()).optional(),
  managerId: Joi.string().uuid().optional()
});

const verifyUserSchema = Joi.object({
  approved: Joi.boolean().required(),
  rejectionReason: Joi.string().when('approved', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(Joi.string()).required()
});

const createPermissionCodeSchema = Joi.object({
  code: Joi.string().pattern(/^[A-Z]+-[A-Z_]+-[A-Z]+$/).required(),
  description: Joi.string().min(10).max(500).required(),
  department: Joi.string().valid('FINANCE', 'OPERATIONS', 'CUSTOMER_SUPPORT', 'COMPLIANCE', 'IT', 'MANAGEMENT').required(),
  resource: Joi.string().min(2).max(100).required(),
  action: Joi.string().valid('VIEW', 'EDIT', 'CREATE', 'DELETE', 'APPROVE', 'EXPORT').required()
});

const deprecatePermissionSchema = Joi.object({
  replacementCode: Joi.string().optional(),
  reason: Joi.string().min(10).required()
});

const reviewDocumentSchema = Joi.object({
  documentIndex: Joi.number().integer().min(0).required(),
  status: Joi.string().valid('approved', 'rejected', 'pending').required(),
  notes: Joi.string().optional()
});

// Admin management (superuser only)
router.post('/users', requireSuperuser, validateRequest(createAdminSchema), adminController.createAdmin);
router.put('/users/:adminId/permissions', requireSuperuser, validateRequest(updatePermissionsSchema), adminController.updateAdminPermissions);

// Organizational hierarchy
router.get('/organization/hierarchy', requirePermission('OPS-USERS-VIEW'), adminController.getOrganizationHierarchy);
router.get('/organization/departments', requirePermission('OPS-USERS-VIEW'), adminController.getDepartments);
router.get('/users/:userId/team', requireRole(['SUPERUSER', 'MANAGER']), adminController.getTeamMembers);

// User verification
router.get('/pending-verifications', requirePermission('OPS-USERS-VIEW'), adminController.getPendingVerifications);
router.get('/users/:userId', requirePermission('OPS-USERS-VIEW'), adminController.getUserDetails);
router.post('/users/:userId/verify', requirePermission('OPS-REQUESTS-APPROVE'), validateRequest(verifyUserSchema), adminController.verifyUser);

// Document review
router.post('/users/:userId/documents/review', requirePermission('COM-VERIFICATION-APPROVE'), validateRequest(reviewDocumentSchema), adminController.reviewDocuments);

// Permission code management
router.get('/permissions', requirePermission('IT-PERMISSIONS-VIEW'), permissionController.getPermissionCodes);
router.post('/permissions', requirePermission('IT-PERMISSIONS-CREATE'), validateRequest(createPermissionCodeSchema), permissionController.createPermissionCode);
router.put('/permissions/:code/deprecate', requirePermission('IT-PERMISSIONS-CREATE'), validateRequest(deprecatePermissionSchema), permissionController.deprecatePermissionCode);
router.get('/permissions/templates', requirePermission('IT-PERMISSIONS-VIEW'), permissionController.getPermissionTemplates);

export default router;
