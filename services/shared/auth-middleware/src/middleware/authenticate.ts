import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JWTService } from '../services/JWTService';
import { SessionManager } from '../services/SessionManager';
import { MissingTokenError, InvalidTokenError } from '../errors';

let jwtService: JWTService;
let sessionManager: SessionManager | undefined;

/**
 * Initialize the JWT service with configuration
 */
export function initializeAuth(
  jwtServiceInstance: JWTService,
  sessionManagerInstance?: SessionManager
) {
  jwtService = jwtServiceInstance;
  sessionManager = sessionManagerInstance;
}

/**
 * Get the current JWT service instance
 */
export function getJWTService(): JWTService {
  if (!jwtService) {
    throw new Error('Auth middleware not initialized. Call initializeAuth() first.');
  }
  return jwtService;
}

/**
 * Get the current session manager instance
 */
export function getSessionManager(): SessionManager | undefined {
  return sessionManager;
}

/**
 * Authentication middleware - requires valid JWT token
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!jwtService) {
      throw new Error('Auth middleware not initialized');
    }

    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new MissingTokenError();
    }

    // Check if token is blacklisted
    if (sessionManager) {
      const isBlacklisted = await sessionManager.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new InvalidTokenError();
      }
    }

    // Verify token
    const payload = jwtService.verifyToken(token);

    // Validate session if session manager is configured
    if (sessionManager && payload.sessionId) {
      const isValidSession = await sessionManager.validateSession(payload.sessionId);
      if (!isValidSession) {
        throw new InvalidTokenError();
      }

      // Update session activity
      await sessionManager.updateActivity(payload.sessionId);
    }

    // Attach user info to request
    req.user = payload;
    req.sessionId = payload.sessionId;

    next();
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }
  }
}

/**
 * Optional authentication - doesn't fail if token is missing/invalid
 * Useful for endpoints that work differently for authenticated users
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!jwtService) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload = jwtService.verifyToken(token);
        
        // Validate session if configured
        if (payload.sessionId) {
          const isValidSession = await jwtService.validateSession(payload.sessionId);
          if (isValidSession) {
            req.user = payload;
            req.sessionId = payload.sessionId;
          }
        } else {
          req.user = payload;
        }
      } catch {
        // Invalid token, but continue without auth
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}
