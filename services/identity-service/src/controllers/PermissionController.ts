// Permission Code Management Controller
// Task: 3.3 - Build permission code registry
// Requirements: 4.1, 4.2, 4.7, 21.1, 21.2

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { PermissionCode, Department, PermissionAction } from '../models/PermissionCode';
import { AuditLog, AuditActionType } from '../models/AuditLog';
import { generateCorrelationId, isValidPermissionCode } from '../utils/security';

export class PermissionController {
  // Get all permission codes
  async getPermissionCodes(req: Request, res: Response) {
    try {
      const { department, deprecated, search } = req.query;
      const permissionRepo = AppDataSource.getRepository(PermissionCode);

      let query = permissionRepo.createQueryBuilder('permission');

      // Filter by department
      if (department) {
        query = query.andWhere('permission.department = :department', { department });
      }

      // Filter by deprecated status
      if (deprecated !== undefined) {
        query = query.andWhere('permission.deprecated = :deprecated', { 
          deprecated: deprecated === 'true' 
        });
      }

      // Search by code or description
      if (search) {
        query = query.andWhere(
          '(permission.code ILIKE :search OR permission.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      const permissions = await query
        .orderBy('permission.department', 'ASC')
        .addOrderBy('permission.resource', 'ASC')
        .addOrderBy('permission.action', 'ASC')
        .getMany();

      res.json({ permissions });
    } catch (error) {
      console.error('Error fetching permission codes:', error);
      res.status(500).json({ error: 'Failed to fetch permission codes' });
    }
  }

  // Create permission code (requires two-person rule)
  async createPermissionCode(req: Request, res: Response) {
    try {
      const { code, description, department, resource, action } = req.body;
      const permissionRepo = AppDataSource.getRepository(PermissionCode);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Validate code format
      if (!isValidPermissionCode(code)) {
        return res.status(400).json({ 
          error: 'Invalid permission code format. Must be DEPT-RESOURCE-ACTION' 
        });
      }

      // Check if code already exists
      const existing = await permissionRepo.findOne({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Permission code already exists' });
      }

      // Create permission code
      const permission = permissionRepo.create({
        code,
        description,
        department,
        resource,
        action,
        version: '1.0.0',
        deprecated: false,
        createdBy: req.user!.userId
      });

      await permissionRepo.save(permission);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.PERMISSION_CODE_CREATED,
        resourceType: 'PERMISSION_CODE',
        resourceId: code,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: permission
      });

      res.status(201).json({ 
        message: 'Permission code created successfully',
        permission 
      });
    } catch (error) {
      console.error('Error creating permission code:', error);
      res.status(500).json({ error: 'Failed to create permission code' });
    }
  }

  // Deprecate permission code
  async deprecatePermissionCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { replacementCode, reason } = req.body;
      const permissionRepo = AppDataSource.getRepository(PermissionCode);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const permission = await permissionRepo.findOne({ where: { code } });
      if (!permission) {
        return res.status(404).json({ error: 'Permission code not found' });
      }

      if (permission.deprecated) {
        return res.status(400).json({ error: 'Permission code already deprecated' });
      }

      // Validate replacement code exists
      if (replacementCode) {
        const replacement = await permissionRepo.findOne({ where: { code: replacementCode } });
        if (!replacement) {
          return res.status(400).json({ error: 'Replacement code not found' });
        }
      }

      const beforeValue = { ...permission };

      // Deprecate permission
      permission.deprecated = true;
      permission.deprecatedAt = new Date();
      permission.replacementCode = replacementCode;

      await permissionRepo.save(permission);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.PERMISSION_CODE_DEPRECATED,
        resourceType: 'PERMISSION_CODE',
        resourceId: code,
        correlationId: generateCorrelationId(),
        entryHash: '',
        beforeValue,
        afterValue: permission,
        metadata: { reason, replacementCode }
      });

      res.json({ 
        message: 'Permission code deprecated successfully',
        permission 
      });
    } catch (error) {
      console.error('Error deprecating permission code:', error);
      res.status(500).json({ error: 'Failed to deprecate permission code' });
    }
  }

  // Get permission templates
  async getPermissionTemplates(req: Request, res: Response) {
    try {
      const templates = {
        'Finance Manager': [
          'FIN-REPORTS-VIEW',
          'FIN-REPORTS-EXPORT',
          'FIN-TRANSACTIONS-VIEW',
          'FIN-ANALYTICS-VIEW'
        ],
        'Operations Manager': [
          'OPS-USERS-VIEW',
          'OPS-USERS-EDIT',
          'OPS-USERS-CREATE',
          'OPS-REQUESTS-VIEW',
          'OPS-REQUESTS-APPROVE'
        ],
        'Support Agent': [
          'SUP-TICKETS-VIEW',
          'SUP-TICKETS-EDIT',
          'SUP-CUSTOMERS-VIEW'
        ],
        'Compliance Officer': [
          'COM-AUDIT-VIEW',
          'COM-AUDIT-EXPORT',
          'COM-VERIFICATION-VIEW',
          'COM-VERIFICATION-APPROVE'
        ],
        'IT Administrator': [
          'IT-SYSTEM-VIEW',
          'IT-SYSTEM-EDIT',
          'IT-PERMISSIONS-VIEW',
          'IT-PERMISSIONS-CREATE'
        ]
      };

      res.json({ templates });
    } catch (error) {
      console.error('Error fetching permission templates:', error);
      res.status(500).json({ error: 'Failed to fetch permission templates' });
    }
  }
}
