import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus, TwoFactorMethod } from '../models/User';
import { hashPassword, generateTwoFactorSecret } from '../utils/security';
import { AuditLog, AuditActionType } from '../models/AuditLog';

export class SuperuserController {
  // Create superuser (max 2 allowed)
  async createSuperuser(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const auditRepo = AppDataSource.getRepository(AuditLog);
      
      // Check if we already have 2 superusers
      const superuserCount = await userRepo.count({ where: { role: UserRole.SUPERUSER } });
      if (superuserCount >= 2) {
        return res.status(403).json({ 
          error: 'Maximum number of superusers (2) already exists' 
        });
      }

      const { email, phone, password, fullName, twoFactorMethod } = req.body;

      // Validate 2FA method is required for superusers
      if (!twoFactorMethod || ![TwoFactorMethod.SMS, TwoFactorMethod.BIOMETRIC, TwoFactorMethod.BOTH].includes(twoFactorMethod)) {
        return res.status(400).json({ 
          error: 'Superusers must have 2FA enabled (SMS, BIOMETRIC, or BOTH)' 
        });
      }

      // Check if user already exists
      const existingUser = await userRepo.findOne({ 
        where: [{ email }, { phone }] 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate 2FA secret
      const twoFactorSecret = generateTwoFactorSecret();

      // Create superuser
      const superuser = userRepo.create({
        email,
        phone,
        passwordHash,
        fullName,
        role: UserRole.SUPERUSER,
        status: UserStatus.VERIFIED,
        twoFactorEnabled: true,
        twoFactorMethod,
        twoFactorSecret,
        governmentVerified: true,
        permissions: ['*'] // Full access
      });

      await userRepo.save(superuser);

      // Log the action
      const audit = auditRepo.create({
        userId: (req as any).user?.id || 'SYSTEM',
        actionType: AuditActionType.USER_CREATED,
        resourceType: 'USER',
        resourceId: superuser.id,
        details: {
          targetUserId: superuser.id,
          role: UserRole.SUPERUSER,
          email: superuser.email
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        correlationId: req.headers['x-correlation-id'] as string
      });
      await auditRepo.save(audit);

      res.status(201).json({
        message: 'Superuser created successfully',
        user: {
          id: superuser.id,
          email: superuser.email,
          role: superuser.role,
          twoFactorMethod: superuser.twoFactorMethod
        }
      });
    } catch (error) {
      console.error('Error creating superuser:', error);
      res.status(500).json({ error: 'Failed to create superuser' });
    }
  }

  // List all superusers
  async listSuperusers(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const superusers = await userRepo.find({ 
        where: { role: UserRole.SUPERUSER },
        select: ['id', 'email', 'phone', 'fullName', 'status', 'twoFactorMethod', 'createdAt', 'lastLoginAt']
      });

      res.json({ superusers });
    } catch (error) {
      console.error('Error listing superusers:', error);
      res.status(500).json({ error: 'Failed to list superusers' });
    }
  }

  // Revoke superuser access
  async revokeSuperuser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userRepo = AppDataSource.getRepository(User);
      const auditRepo = AppDataSource.getRepository(AuditLog);

      const superuser = await userRepo.findOne({ 
        where: { id: userId, role: UserRole.SUPERUSER } 
      });

      if (!superuser) {
        return res.status(404).json({ error: 'Superuser not found' });
      }

      // Downgrade to admin
      superuser.role = UserRole.ADMIN;
      await userRepo.save(superuser);

      // Log the action
      const audit = auditRepo.create({
        userId: (req as any).user?.id || 'SYSTEM',
        actionType: AuditActionType.ROLE_CHANGED,
        resourceType: 'USER',
        resourceId: superuser.id,
        details: {
          targetUserId: superuser.id,
          oldRole: UserRole.SUPERUSER,
          newRole: UserRole.ADMIN
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        correlationId: req.headers['x-correlation-id'] as string
      });
      await auditRepo.save(audit);

      res.json({ message: 'Superuser access revoked successfully' });
    } catch (error) {
      console.error('Error revoking superuser:', error);
      res.status(500).json({ error: 'Failed to revoke superuser' });
    }
  }
}
