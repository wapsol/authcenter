import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface InternalApp {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  api_endpoints?: string;
  manifest_data?: string;
  status: string;
  created_at: Date;
}

export interface CreateInternalAppData {
  name: string;
  display_name: string;
  description?: string;
  logo_url?: string;
  api_endpoints?: string;
  manifest_data?: string;
}

export interface AppMapping {
  id: number;
  external_provider_id: number;
  internal_app_id: number;
  connection_id: number;
  created_at: Date;
  external_provider_name?: string;
  internal_app_name?: string;
}

export class InternalAppService {
  private get db() {
    return getDatabase();
  }

  async getAllApps(): Promise<InternalApp[]> {
    try {
      const result = await this.db.all(
        'SELECT * FROM internal_apps WHERE status = ? ORDER BY display_name',
        ['active']
      );
      return result;
    } catch (error) {
      logger.error('Get all internal apps error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async getAppById(id: number): Promise<InternalApp | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM internal_apps WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      logger.error('Get internal app by ID error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async getAppByName(name: string): Promise<InternalApp | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM internal_apps WHERE name = ?',
        [name]
      );
      return result || null;
    } catch (error) {
      logger.error('Get internal app by name error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async createApp(appData: CreateInternalAppData): Promise<InternalApp> {
    try {
      // Check if app name already exists
      const existing = await this.getAppByName(appData.name);
      if (existing) {
        throw createError('App with this name already exists', 409);
      }

      const result = await this.db.run(
        `INSERT INTO internal_apps (name, display_name, description, logo_url, api_endpoints, manifest_data)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          appData.name,
          appData.display_name,
          appData.description,
          appData.logo_url,
          appData.api_endpoints,
          appData.manifest_data
        ]
      );

      const app = await this.db.get(
        'SELECT * FROM internal_apps WHERE id = ?',
        [result.lastID]
      );

      return app!;
    } catch (error) {
      logger.error('Create internal app error:', error);
      throw error;
    }
  }

  async updateApp(id: number, appData: Partial<CreateInternalAppData>): Promise<InternalApp> {
    try {
      const existing = await this.getAppById(id);
      if (!existing) {
        throw createError('Internal app not found', 404);
      }

      const updates = Object.entries(appData)
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => `${key} = ?`);

      if (updates.length === 0) {
        return existing;
      }

      const values: any[] = Object.values(appData).filter(value => value !== undefined);
      values.push(id);

      await this.db.run(
        `UPDATE internal_apps SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      const updatedApp = await this.getAppById(id);
      return updatedApp!;
    } catch (error) {
      logger.error('Update internal app error:', error);
      throw error;
    }
  }

  async deleteApp(id: number): Promise<void> {
    try {
      const result = await this.db.run(
        'UPDATE internal_apps SET status = ? WHERE id = ?',
        ['deleted', id]
      );

      if (result.changes === 0) {
        throw createError('Internal app not found', 404);
      }
    } catch (error) {
      logger.error('Delete internal app error:', error);
      throw error;
    }
  }

  async createMapping(externalProviderId: number, internalAppId: number, connectionId: number): Promise<AppMapping> {
    try {
      const result = await this.db.run(
        `INSERT INTO app_mappings (external_provider_id, internal_app_id, connection_id)
         VALUES (?, ?, ?)`,
        [externalProviderId, internalAppId, connectionId]
      );

      const mapping = await this.db.get(
        'SELECT * FROM app_mappings WHERE id = ?',
        [result.lastID]
      );

      return mapping!;
    } catch (error) {
      logger.error('Create app mapping error:', error);
      throw createError('Failed to create app mapping', 500);
    }
  }

  async getMappings(): Promise<AppMapping[]> {
    try {
      const result = await this.db.all(
        `SELECT 
           am.*,
           p.display_name as external_provider_name,
           ia.display_name as internal_app_name
         FROM app_mappings am
         JOIN providers p ON am.external_provider_id = p.id
         JOIN internal_apps ia ON am.internal_app_id = ia.id
         ORDER BY am.created_at DESC`
      );
      return result;
    } catch (error) {
      logger.error('Get app mappings error:', error);
      throw createError('Failed to fetch app mappings', 500);
    }
  }

  async deleteMapping(id: number): Promise<void> {
    try {
      const result = await this.db.run(
        'DELETE FROM app_mappings WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        throw createError('App mapping not found', 404);
      }
    } catch (error) {
      logger.error('Delete app mapping error:', error);
      throw error;
    }
  }
}