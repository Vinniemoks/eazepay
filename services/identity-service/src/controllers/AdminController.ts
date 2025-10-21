import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../models/User';
import { UserPermission } from '../models/UserPermission';
import { PermissionCode, Department } from '../models/PermissionCode';
import { AccessRequest, RequestStatus } from '../models/AccessRequest';
import { AuditLog, AuditActionType } from '../models/AuditLog';
import { hashPassword, generateCorrelationId, redactSensitiveData } from '../utils/security';

export class AdminController {
  // Create admin with specific permissions
  async createAdmin(req: Request, res: Response) {
    try {
      const { email, phone, password, fullName, role, department, permissions, managerId } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      const permissionRepo = AppDataSource.getRepository(UserPermission);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Only superusers can create admins
      if (req.user.role !== UserRole.SUPERUSER) {
        return res.status(403).json({ error: 'Only superusers can create admins' });
      }

      // Check if user exists
      const existingUser = await userRepo.findOne({ 
        where: [{ email }, { phone }] 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Validate role
      if (![UserRole.MANAGER, UserRole.EMPLOYEE].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be MANAGER or EMPLOYEE' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create admin
      const admin = userRepo.create({
        email,
        phone,
        passwordHash,
        fullName,
        role,
        department,
        managerId,
        status: UserStatus.ACTIVE,
        governmentVerified: true
      });

      await userRepo.save(admin);

      // Grant permissions
      if (permissions && permissions.length > 0) {
        for (const permCode of permissions) {
          const permission = permissionRepo.create({
            userId: admin.id,
            permissionCode: permCode,
            grantedBy: req.user?.userId
          });
          await permissionRepo.save(permission);
        }
      }

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.USER_CREATED,
        resourceType: 'USER',
        resourceId: admin.id,
        correlationId: generateCorrelationId(),
        entryHash: '',
        afterValue: redactSensitiveData(admin)
      });

      res.status(201).json({
        message: 'Admin created successfully',
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ error: 'Failed to create admin' });
    }
  }

  // Get organizational hierarchy
  async getOrganizationHierarchy(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);

      // Get all active users with their managers
      const users = await userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.manager', 'manager')
        .where('user.status = :status', { status: UserStatus.ACTIVE })
        .andWhere('user.role IN (:...roles)', { 
          roles: [UserRole.SUPERUSER, UserRole.MANAGER, UserRole.EMPLOYEE] 
        })
        .select([
          'user.id',
          'user.fullName',
          'user.email',
          'user.role',
          'user.department',
          'user.managerId',
          'manager.id',
          'manager.fullName'
        ])
        .getMany();

      // Build hierarchy tree
      const hierarchy = this.buildHierarchyTree(users);

      res.json({ hierarchy });
    } catch (error) {
      console.error('Error fetching organization hierarchy:', error);
      res.status(500).json({ error: 'Failed to fetch organization hierarchy' });
    }
  }

  // Helper: Build hierarchy tree
  private buildHierarchyTree(users: User[]): any[] {
    const userMap = new Map();
    const roots: any[] = [];

    // Create map of users
    users.forEach(user => {
      userMap.set(user.id, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        managerId: user.managerId,
        children: []
      });
    });

    // Build tree
    users.forEach(user => {
      const node = userMap.get(user.id);
      if (user.managerId && userMap.has(user.managerId)) {
        userMap.get(user.managerId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // Get pending verifications
  async getPendingVerifications(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      
      const pendingUsers = await userRepo.find({
        where: { status: UserStatus.PENDING },
        order: { createdAt: 'ASC' }
      });

      res.json({ pendingUsers });
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      res.status(500).json({ error: 'Failed to fetch pending verifications' });
    }
  }

  // Verify user (customer or agent)
  async verifyUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { approved, rejectionReason } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const beforeValue = { ...user };

      if (approved) {
        user.status = UserStatus.ACTIVE;
        user.verifiedBy = req.user!.userId;
        user.verifiedAt = new Date();
      } else {
        user.status = UserStatus.REJECTED;
        user.rejectionReason = rejectionReason;
      }

      await userRepo.save(user);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.USER_UPDATED,
        resourceType: 'USER',
        resourceId: user.id,
        correlationId: generateCorrelationId(),
        entryHash: '',
        beforeValue: redactSensitiveData(beforeValue),
        afterValue: redactSensitiveData(user),
        metadata: { action: approved ? 'approved' : 'rejected' }
      });

      res.json({
        message: `User ${approved ? 'verified' : 'rejected'} successfully`,
        user: {
          id: user.id,
          status: user.status
        }
      });
    } catch (error) {
      console.error('Error verifying user:', error);
      res.status(500).json({ error: 'Failed to verify user' });
    }
  }

  // Get departments
  async getDepartments(req: Request, res: Response) {
    try {
      const departments = Object.values(Department).map(dept => ({
        code: dept,
        name: dept.replace('_', ' ')
      }));

      res.json({ departments });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  }

  // Get team members (for managers)
  async getTeamMembers(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userRepo = AppDataSource.getRepository(User);

      const teamMembers = await userRepo.find({
        where: { managerId: userId, status: UserStatus.ACTIVE },
        select: ['id', 'fullName', 'email', 'role', 'department', 'createdAt']
      });

      res.json({ teamMembers });
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }

  // Review uploaded documents
  async reviewDocuments(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { documentIndex, status, notes } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.verificationDocuments || !user.verificationDocuments[documentIndex]) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const beforeValue = { ...user.verificationDocuments[documentIndex] };
      user.verificationDocuments[documentIndex].status = status;
      await userRepo.save(user);

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.USER_UPDATED,
        resourceType: 'DOCUMENT',
        resourceId: `${userId}:${documentIndex}`,
        correlationId: generateCorrelationId(),
        entryHash: '',
        beforeValue,
        afterValue: user.verificationDocuments[documentIndex],
        metadata: { notes }
      });

      res.json({
        message: 'Document reviewed successfully',
        document: user.verificationDocuments[documentIndex]
      });
    } catch (error) {
      console.error('Error reviewing document:', error);
      res.status(500).json({ error: 'Failed to review document' });
    }
  }

  // Get user details for admin review
  async getUserDetails(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      const permissionRepo = AppDataSource.getRepository(UserPermission);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user permissions
      const permissions = await permissionRepo.find({
        where: { userId },
        relations: ['permission']
      });

      res.json({ 
        user: redactSensitiveData(user),
        permissions: permissions.filter(p => p.isActive())
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  }

  // Update admin permissions
  async updateAdminPermissions(req: Request, res: Response) {
    try {
      const { adminId } = req.params;
      const { permissions } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      const permissionRepo = AppDataSource.getRepository(UserPermission);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      // Only superusers can update admin permissions
      if (req.user.role !== UserRole.SUPERUSER) {
        return res.status(403).json({ error: 'Only superusers can update admin permissions' });
      }

      const admin = await userRepo.findOne({ 
        where: { id: adminId },
        where: { role: UserRole.MANAGER } as any
      });
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      // Get current permissions
      const currentPermissions = await permissionRepo.find({ where: { userId: adminId } });
      const currentCodes = currentPermissions.map(p => p.permissionCode);

      // Determine permissions to add and remove
      const toAdd = permissions.filter((p: string) => !currentCodes.includes(p));
      const toRemove = currentCodes.filter(p => !permissions.includes(p));

      // Remove old permissions
      if (toRemove.length > 0) {
        await permissionRepo.delete({ 
          userId: adminId, 
          permissionCode: { $in: toRemove } as any
        });
      }

      // Add new permissions
      for (const permCode of toAdd) {
        const permission = permissionRepo.create({
          userId: adminId,
          permissionCode: permCode,
          grantedBy: req.user!.userId
        });
        await permissionRepo.save(permission);
      }

      // Audit log
      await auditRepo.save({
        timestamp: new Date(),
        actorUserId: req.user!.userId,
        actorRole: req.user!.role,
        actorIpAddress: req.ip,
        actorUserAgent: req.headers['user-agent'],
        actionType: AuditActionType.PERMISSION_GRANTED,
        resourceType: 'USER_PERMISSIONS',
        resourceId: adminId,
        correlationId: generateCorrelationId(),
        entryHash: '',
        beforeValue: { permissions: currentCodes },
        afterValue: { permissions },
        metadata: { added: toAdd, removed: toRemove }
      });

      res.json({
        message: 'Admin permissions updated successfully',
        admin: {
          id: admin.id,
          permissions: admin.permissions
        }
      });
    } catch (error) {
      console.error('Error updating admin permissions:', error);
      res.status(500).json({ error: 'Failed to update admin permissions' });
    }
  }
}
