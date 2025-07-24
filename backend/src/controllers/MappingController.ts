import { Request, Response } from 'express';
import { InternalAppService } from '../services/InternalAppService';
import { AuditService } from '../services/AuditService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class MappingController {
  private internalAppService = new InternalAppService();
  private auditService = new AuditService();

  getInternalApps = async (req: Request, res: Response): Promise<void> => {
    try {
      const apps = await this.internalAppService.getAllApps();
      res.json({ apps });
    } catch (error) {
      logger.error('Get internal apps error:', error);
      throw error;
    }
  };

  getMappings = async (req: Request, res: Response): Promise<void> => {
    try {
      const mappings = await this.internalAppService.getMappings();
      res.json({ mappings });
    } catch (error) {
      logger.error('Get mappings error:', error);
      throw error;
    }
  };

  createMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const { external_provider_id, internal_app_id, connection_id } = req.body;

      if (!external_provider_id || !internal_app_id || !connection_id) {
        throw createError('Missing required fields', 400);
      }

      const mapping = await this.internalAppService.createMapping(
        external_provider_id,
        internal_app_id,
        connection_id
      );

      await this.auditService.logEvent({
        event_type: 'mapping_created',
        user_identifier: 'user', // We'll improve this when user auth is added
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: true,
        details: JSON.stringify({
          mapping_id: mapping.id,
          external_provider_id,
          internal_app_id,
          connection_id
        })
      });

      res.json({ mapping, message: 'App mapping created successfully' });
    } catch (error) {
      logger.error('Create mapping error:', error);
      
      await this.auditService.logEvent({
        event_type: 'mapping_failed',
        user_identifier: 'user',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };

  deleteMapping = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.internalAppService.deleteMapping(parseInt(id));

      await this.auditService.logEvent({
        event_type: 'mapping_deleted',
        user_identifier: 'user',
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        success: true,
        details: JSON.stringify({ mapping_id: id })
      });

      res.json({ message: 'App mapping deleted successfully' });
    } catch (error) {
      logger.error('Delete mapping error:', error);
      throw error;
    }
  };
}