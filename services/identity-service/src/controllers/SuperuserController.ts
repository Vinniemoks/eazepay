import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User, UserRole, UserStatus, TwoFactorMethod } from '../models/User';
import bcrypt from 'bcrypt';
import { generateTwoFactorSecret, sendSMS } from '../utils/security';

export class SuperuserController {
  // Create superuser (max 2 allowed)
  async createSuperuser(req: Request, res: Response) {
    try {
      const userRepo = getRepository(User);
      
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
      const passwordHash = await bcrypt.hash(password, 12);

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

      // Send 2FA setup instructions
      if (twoFactorMethod === TwoFactorMethod.SMS || twoFactorMethod === TwoFactorMethod.BOTH) {
        await sendSMS(phone, `Your AfriPay superuser account has been created. 2FA is enabled.`);
      }

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
      const userRepo = getRepository(User);
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
      const userRepo = getRepository(User);

      const superuser = await userRepo.findOne({ 
        where: { id: userId, role: UserRole.SUPERUSER } 
      });

      if (!superuser) {
        return res.status(404).json({ error: 'Superuser not found' });
      }

      // Downgrade to admin
      superuser.role = UserRole.ADMIN;
      superuser.permissions = ['users:read', 'users:verify', 'transactions:read'];
      await userRepo.save(superuser);

      res.json({ message: 'Superuser access revoked successfully' });
    } catch (error) {
      console.error('Error revoking superuser:', error);
      res.status(500).json({ error: 'Failed to revoke superuser' });
    }
  }
}
