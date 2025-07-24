import { Request, Response } from 'express';
import { ProviderService } from '../services/ProviderService';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ProviderController {
  private providerService = new ProviderService();

  getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      const providers = await this.providerService.getAllProviders();
      res.json({ providers });
    } catch (error) {
      logger.error('Get providers error:', error);
      throw createError('Failed to fetch providers', 500);
    }
  };

  getProvider = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const provider = await this.providerService.getProviderById(parseInt(id));
      
      if (!provider) {
        throw createError('Provider not found', 404);
      }

      res.json({ provider });
    } catch (error) {
      logger.error('Get provider error:', error);
      throw error;
    }
  };
}