import { Response } from 'express';
import { UserService } from '../services/UserService';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ConnectionController {
  private userService = new UserService();
  private googleAuthService = new GoogleAuthService();

  getUserConnections = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const connections = await this.userService.getUserConnections(req.user.id);
      res.json({ connections });
    } catch (error) {
      logger.error('Get user connections error:', error);
      throw error;
    }
  };

  getConnection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const connection = await this.userService.getConnection(req.user.id, parseInt(id));
      
      if (!connection) {
        throw createError('Connection not found', 404);
      }

      res.json({ connection });
    } catch (error) {
      logger.error('Get connection error:', error);
      throw error;
    }
  };

  deleteConnection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      await this.userService.deleteConnection(req.user.id, parseInt(id));
      
      res.json({ message: 'Connection deleted successfully' });
    } catch (error) {
      logger.error('Delete connection error:', error);
      throw error;
    }
  };

  refreshConnection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw createError('User not authenticated', 401);
      }

      const { id } = req.params;
      const connection = await this.userService.getConnection(req.user.id, parseInt(id));
      
      if (!connection) {
        throw createError('Connection not found', 404);
      }

      if (connection.provider_name === 'google') {
        // Refresh would be implemented here
        res.json({ message: 'Connection refresh initiated' });
      } else {
        throw createError('Provider not supported for refresh', 400);
      }
    } catch (error) {
      logger.error('Refresh connection error:', error);
      throw error;
    }
  };
}