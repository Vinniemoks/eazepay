import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserModel } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { phoneNumber, email, fullName, nationalId, password } = req.body;

      const { user, tokens } = await AuthService.register({
        phoneNumber,
        email,
        fullName,
        nationalId,
        password
      });

      // Don't send password hash
      const { passwordHash, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { phoneNumber, password } = req.body;
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };

      const { user, tokens } = await AuthService.login(phoneNumber, password, deviceInfo);

      // Don't send password hash
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const userId = (req as any).user.userId;

      await AuthService.logout(userId, refreshToken);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Don't send password hash
      const { passwordHash, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: { user: userWithoutPassword }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
