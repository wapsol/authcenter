import { Request, Response } from 'express';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { UserService } from '../services/UserService';
import { generateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
  private googleAuthService = new GoogleAuthService();
  private userService = new UserService();

  initiateGoogleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const authUrl = this.googleAuthService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      logger.error('Failed to initiate Google auth:', error);
      throw createError('Failed to initiate authentication', 500);
    }
  };

  handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        throw createError(`Authentication failed: ${error}`, 400);
      }

      if (!code || typeof code !== 'string') {
        throw createError('Authorization code is required', 400);
      }

      const tokens = await this.googleAuthService.exchangeCodeForTokens(code);
      const userInfo = await this.googleAuthService.getUserInfo(tokens.access_token);
      
      let user = await this.userService.findByEmail(userInfo.email);
      if (!user) {
        user = await this.userService.create({
          email: userInfo.email,
          name: userInfo.name
        });
      }

      await this.userService.createOrUpdateConnection(user.id, {
        provider: 'google',
        externalId: userInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        scopes: tokens.scope?.split(' ') || []
      });

      const jwtToken = generateToken(user.id, user.email);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
    } catch (error) {
      logger.error('Google callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({ message: 'Logged out successfully' });
  };

  getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const user = await this.userService.findById(req.user.id);
      if (!user) {
        throw createError('User not found', 404);
      }

      const connections = await this.userService.getUserConnections(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        connections: connections.map(conn => ({
          id: conn.id,
          provider: conn.provider_name,
          status: conn.status,
          createdAt: conn.created_at
        }))
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  };
}