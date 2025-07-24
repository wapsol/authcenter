import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface Provider {
  id: number;
  name: string;
  display_name: string;
  oauth_config: any;
  scopes: string[];
  enabled: boolean;
  created_at: Date;
}

export class ProviderService {
  private get db() {
    return getDatabase();
  }

  async getAllProviders(): Promise<Provider[]> {
    try {
      const result = await this.db.all(
        'SELECT * FROM providers WHERE enabled = 1 ORDER BY display_name'
      );
      return result.map(row => ({
        ...row,
        oauth_config: JSON.parse(row.oauth_config),
        scopes: row.scopes.split(',')
      }));
    } catch (error) {
      logger.error('Get all providers error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async getProviderById(id: number): Promise<Provider | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM providers WHERE id = ?',
        [id]
      );
      if (!result) return null;
      return {
        ...result,
        oauth_config: JSON.parse(result.oauth_config),
        scopes: result.scopes.split(',')
      };
    } catch (error) {
      logger.error('Get provider by ID error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async getProviderByName(name: string): Promise<Provider | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM providers WHERE name = ?',
        [name]
      );
      if (!result) return null;
      return {
        ...result,
        oauth_config: JSON.parse(result.oauth_config),
        scopes: result.scopes.split(',')
      };
    } catch (error) {
      logger.error('Get provider by name error:', error);
      throw createError('Database query failed', 500);
    }
  }
}