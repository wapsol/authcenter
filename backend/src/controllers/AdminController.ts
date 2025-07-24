import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { InternalAppService } from '../services/InternalAppService';
import { AuditService } from '../services/AuditService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminController {
  private adminService = new AdminService();
  private internalAppService = new InternalAppService();
  private auditService = new AuditService();

  verifyPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { password } = req.body;
      
      if (!password) {
        throw createError('Password is required', 400);
      }

      const isValid = await this.adminService.verifyPassword(password);
      
      if (!isValid) {
        await this.auditService.logEvent({
          event_type: 'admin_login_failed',
          user_identifier: 'admin',
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          success: false,
          error_message: 'Invalid password'
        });
        
        throw createError('Invalid password', 401);
      }

      await this.auditService.logEvent({
        event_type: 'admin_login_success',
        user_identifier: 'admin',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: true
      });

      res.json({ success: true, message: 'Admin authenticated' });
    } catch (error) {
      logger.error('Admin password verification error:', error);
      throw error;
    }
  };

  getInternalApps = async (req: Request, res: Response): Promise<void> => {
    try {
      const apps = await this.internalAppService.getAllApps();
      res.json({ apps });
    } catch (error) {
      logger.error('Get internal apps error:', error);
      throw createError('Failed to fetch internal apps', 500);
    }
  };

  createInternalApp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, display_name, description, logo_url, api_endpoints, manifest_data } = req.body;
      
      const appData = {
        name,
        display_name,
        description,
        logo_url,
        api_endpoints,
        manifest_data
      };

      const app = await this.internalAppService.createApp(appData);

      await this.auditService.logEvent({
        event_type: 'internal_app_created',
        internal_app: name,
        user_identifier: 'admin',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: true,
        details: JSON.stringify({ app_id: app.id })
      });

      res.json({ app, message: 'Internal app created successfully' });
    } catch (error) {
      logger.error('Create internal app error:', error);
      throw createError('Failed to create internal app', 500);
    }
  };

  getAuthLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 100, offset = 0, event_type } = req.query;
      
      const logs = await this.auditService.getLogs({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        event_type: event_type as string
      });

      res.json({ logs });
    } catch (error) {
      logger.error('Get auth logs error:', error);
      throw createError('Failed to fetch auth logs', 500);
    }
  };

  getLogStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.auditService.getLogStats();
      res.json({ stats });
    } catch (error) {
      logger.error('Get log stats error:', error);
      throw createError('Failed to fetch log statistics', 500);
    }
  };
}