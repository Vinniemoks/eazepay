// Access Request Workflow Controller
// Task: 4.1-4.7 - Build access request approval system
// Requirements: 5.1-5.8, 17.1-17.11

import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { AccessRequest, RequestStatus, RequestUrgency } from '../models/AccessRequest';
import { User, UserRole } from '../models/User';
import { UserPermission } from '../models/UserPermission';
import { PermissionCode } from '../models/PermissionCode';
import { AuditLog, AuditActionType } from '../models/AuditLog';
import { generateCorrelationId } from '../utils/security';
import { MoreThan } from 'typeorm';

export class AccessRequestController {
  // Create access request (managers only)
  async createAccessRequest(req: Request, res: Response) {
    try {
      const { targetUserId, requestedPermissions, justification, urgency } = req.body;
      const requesterId = req.user!.userId;

      const userRepo = AppDataSource.getRepository(User);
      const requestRepo = AppDataSource.getRepository(AccessRequest);
      const permissionRepo = AppDataSource.getRepository(PermissionCode);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Verify requester is a manager
      const requester = await userRepo.findOne({ where: { id: requesterId } });
      if (!requester || requester.role !== UserRole.MANAGER) {
        return res.status(403).json({ 
          error: 'Only managers can submit access requests',
          code: 'AUTH_002'
        });
      }

      // Verify target user exists
      const targetUser = await userRepo.findOne({ where: { id: targetUserId } });
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Verify requester is not requesting for themselves
      if (requesterId === targetUserId) {
        return res.status(400).json({ 
          error: 'Cannot create access request for yourself' 
        });
      }

      // Verify all requested permissions exist
      for (const permCode of requestedPermissions) {
        const permission = await permissionRepo.findOne({ where: { code: permCode } });
        if (!permission) {
          return res.status(400).json({ 
            error: `Permission code not found: ${permCode}` 
          });
        }
        if (permission.deprecated) {
          return res.status(400).json({ 
            error: `Permission code is deprecated: ${permCode}. Use ${permission.replacementCode} instead.` 
          });
        }
      }

      // Verify manager has the permissions they're requesting for others
      const managerPermissions = await AppDataSource.getRepository(UserPermission).find({
        where: { userId: requesterId }
      });
      const managerPermCodes = managerPermissions.map(p => p.permissionCode);
      
      const missingPermissions = requestedPermissions.filter(
        (p: string) => !managerPermCodes.includes(p)
      );
      if (missingPermissions.length > 0) {
        return res.status(403).json({ 
          error: 'Cannot request permissions you do not possess',
          missingPermissions
        });
      }

      // Create access request
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const accessRequest = requestRepo.create({
        requesterId,
        targetUserId,
        requestedPermissions,
        justification,
        urgency: urgency || RequestUrgency.MEDIUM,
        status: RequestStatus.PENDING,
        expiresAt
      });

      await requestRepo.save(accessRequest);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: requesterId,
        actorRole: requester.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.ACCESS_REQUEST_CREATED,
        resourceType: 'ACCESS_REQUEST',
        resourceId: accessRequest.id,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: accessRequest
      });

      // TODO: Notify superusers via WebSocket and email

      res.status(201).json({
        message: 'Access request created successfully',
        request: {
          id: accessRequest.id,
          status: accessRequest.status,
          expiresAt: accessRequest.expiresAt,
          daysUntilExpiry: accessRequest.daysUntilExpiry()
        }
      });
    } catch (error) {
      console.error('Error creating access request:', error);
      res.status(500).json({ error: 'Failed to create access request' });
    }
  }

  // Get pending requests (superusers only)
  async getPendingRequests(req: Request, res: Response) {
    try {
      const requestRepo = AppDataSource.getRepository(AccessRequest);

      const requests = await requestRepo.find({
        where: { status: RequestStatus.PENDING },
        relations: ['requester', 'targetUser'],
        order: { 
          urgency: 'DESC', // CRITICAL first
          createdAt: 'ASC'  // Oldest first
        }
      });

      // Filter out expired requests
      const activeRequests = requests.filter(r => !r.isExpired());

      // Map to safe response format
      const safeRequests = activeRequests.map(r => ({
        id: r.id,
        requester: {
          id: r.requester.id,
          fullName: r.requester.fullName,
          email: r.requester.email,
          department: r.requester.department
        },
        targetUser: {
          id: r.targetUser.id,
          fullName: r.targetUser.fullName,
          email: r.targetUser.email,
          role: r.targetUser.role,
          department: r.targetUser.department
        },
        requestedPermissions: r.requestedPermissions,
        justification: r.justification,
        urgency: r.urgency,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        daysUntilExpiry: r.daysUntilExpiry()
      }));

      res.json({ requests: safeRequests });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  }

  // Get request details
  async getRequestDetails(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const requestRepo = AppDataSource.getRepository(AccessRequest);
      const userPermRepo = AppDataSource.getRepository(UserPermission);

      const request = await requestRepo.findOne({
        where: { id: requestId },
        relations: ['requester', 'targetUser', 'reviewer']
      });

      if (!request) {
        return res.status(404).json({ error: 'Access request not found' });
      }

      // Get target user's current permissions
      const currentPermissions = await userPermRepo.find({
        where: { userId: request.targetUserId },
        relations: ['permission']
      });

      res.json({
        request: {
          id: request.id,
          requester: {
            id: request.requester.id,
            fullName: request.requester.fullName,
            email: request.requester.email,
            department: request.requester.department
          },
          targetUser: {
            id: request.targetUser.id,
            fullName: request.targetUser.fullName,
            email: request.targetUser.email,
            role: request.targetUser.role,
            department: request.targetUser.department,
            currentPermissions: currentPermissions
              .filter(p => p.isActive())
              .map(p => ({
                code: p.permissionCode,
                description: p.permission.description,
                grantedAt: p.grantedAt
              }))
          },
          requestedPermissions: request.requestedPermissions,
          justification: request.justification,
          urgency: request.urgency,
          status: request.status,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt,
          reviewedAt: request.reviewedAt,
          reviewer: request.reviewer ? {
            id: request.reviewer.id,
            fullName: request.reviewer.fullName
          } : null,
          reviewReason: request.reviewReason
        }
      });
    } catch (error) {
      console.error('Error fetching request details:', error);
      res.status(500).json({ error: 'Failed to fetch request details' });
    }
  }

  // Approve access request
  async approveRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const approverId = req.user!.userId;

      const requestRepo = AppDataSource.getRepository(AccessRequest);
      const userPermRepo = AppDataSource.getRepository(UserPermission);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const request = await requestRepo.findOne({
        where: { id: requestId },
        relations: ['requester', 'targetUser']
      });

      if (!request) {
        return res.status(404).json({ error: 'Access request not found' });
      }

      if (request.status !== RequestStatus.PENDING) {
        return res.status(400).json({ 
          error: `Request already ${request.status.toLowerCase()}` 
        });
      }

      if (request.isExpired()) {
        request.status = RequestStatus.EXPIRED;
        await requestRepo.save(request);
        return res.status(400).json({ error: 'Request has expired' });
      }

      // Validate Segregation of Duties
      if (approverId === request.requesterId) {
        return res.status(403).json({ 
          error: 'Cannot approve your own request (SoD violation)',
          code: 'REQ_003'
        });
      }

      if (approverId === request.targetUserId) {
        return res.status(403).json({ 
          error: 'Cannot approve request for yourself (SoD violation)',
          code: 'REQ_003'
        });
      }

      // Check if approver is target's direct manager (would need second approval)
      if (request.targetUser.managerId === approverId) {
        // TODO: Implement two-person rule for direct reports
        console.warn('Approver is target\'s direct manager - two-person rule should apply');
      }

      // Approve request
      request.status = RequestStatus.APPROVED;
      request.reviewedAt = new Date();
      request.reviewedBy = approverId;
      request.reviewReason = reason;

      await requestRepo.save(request);

      // Grant permissions
      for (const permCode of request.requestedPermissions) {
        const permission = userPermRepo.create({
          userId: request.targetUserId,
          permissionCode: permCode,
          grantedBy: approverId
        });
        await userPermRepo.save(permission);
      }

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: approverId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.ACCESS_REQUEST_APPROVED,
        resourceType: 'ACCESS_REQUEST',
        resourceId: request.id,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: request,
        metadata: { 
          grantedPermissions: request.requestedPermissions,
          targetUserId: request.targetUserId
        }
      });

      // TODO: Notify requester and target user

      res.json({
        message: 'Access request approved successfully',
        request: {
          id: request.id,
          status: request.status,
          grantedPermissions: request.requestedPermissions
        }
      });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ error: 'Failed to approve request' });
    }
  }

  // Reject access request
  async rejectRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      const reviewerId = req.user!.userId;

      if (!reason || reason.length < 10) {
        return res.status(400).json({ 
          error: 'Rejection reason required (minimum 10 characters)' 
        });
      }

      const requestRepo = AppDataSource.getRepository(AccessRequest);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const request = await requestRepo.findOne({
        where: { id: requestId },
        relations: ['requester', 'targetUser']
      });

      if (!request) {
        return res.status(404).json({ error: 'Access request not found' });
      }

      if (request.status !== RequestStatus.PENDING) {
        return res.status(400).json({ 
          error: `Request already ${request.status.toLowerCase()}` 
        });
      }

      // Reject request
      request.status = RequestStatus.REJECTED;
      request.reviewedAt = new Date();
      request.reviewedBy = reviewerId;
      request.reviewReason = reason;

      await requestRepo.save(request);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: reviewerId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.ACCESS_REQUEST_REJECTED,
        resourceType: 'ACCESS_REQUEST',
        resourceId: request.id,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: request,
        metadata: { reason }
      });

      // TODO: Notify requester with rejection reason

      res.json({
        message: 'Access request rejected',
        request: {
          id: request.id,
          status: request.status,
          reason: request.reviewReason
        }
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: 'Failed to reject request' });
    }
  }

  // Get user's submitted requests
  async getMyRequests(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const requestRepo = AppDataSource.getRepository(AccessRequest);

      const requests = await requestRepo.find({
        where: { requesterId: userId },
        relations: ['targetUser', 'reviewer'],
        order: { createdAt: 'DESC' }
      });

      res.json({ requests });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }

  // Get requests for a specific user
  async getRequestsForUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const requestRepo = AppDataSource.getRepository(AccessRequest);

      const requests = await requestRepo.find({
        where: { targetUserId: userId },
        relations: ['requester', 'reviewer'],
        order: { createdAt: 'DESC' }
      });

      res.json({ requests });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }

  // Emergency break-glass access
  async grantEmergencyAccess(req: Request, res: Response) {
    try {
      const { targetUserId, permissions, justification } = req.body;
      const grantorId = req.user!.userId;

      if (!justification || justification.length < 50) {
        return res.status(400).json({ 
          error: 'Emergency access requires detailed justification (minimum 50 characters)' 
        });
      }

      const userPermRepo = AppDataSource.getRepository(UserPermission);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Grant permissions with 24-hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      for (const permCode of permissions) {
        const permission = userPermRepo.create({
          userId: targetUserId,
          permissionCode: permCode,
          grantedBy: grantorId,
          expiresAt,
          notes: `EMERGENCY ACCESS: ${justification}`
        });
        await userPermRepo.save(permission);
      }

      // Audit log with special flag
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: grantorId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.EMERGENCY_ACCESS_GRANTED,
        resourceType: 'USER_PERMISSIONS',
        resourceId: targetUserId,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: { permissions, expiresAt },
        metadata: { 
          justification,
          requiresPostHocReview: true,
          reviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      // TODO: Alert all superusers for mandatory post-hoc review

      res.json({
        message: 'Emergency access granted',
        expiresAt,
        requiresPostHocReview: true,
        reviewDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error('Error granting emergency access:', error);
      res.status(500).json({ error: 'Failed to grant emergency access' });
    }
  }
}
