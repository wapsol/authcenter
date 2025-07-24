import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
}

export interface Connection {
  id: number;
  user_id: number;
  provider_id: number;
  provider_name: string;
  external_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateConnectionData {
  provider: string;
  externalId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

export class UserService {
  private get db() {
    return getDatabase();
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return result || null;
    } catch (error) {
      logger.error('Find user by email error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const result = await this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return result || null;
    } catch (error) {
      logger.error('Find user by ID error:', error);
      throw createError('Database query failed', 500);
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const result = await this.db.run(
        'INSERT INTO users (email, name) VALUES (?, ?)',
        [userData.email, userData.name]
      );
      const user = await this.db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      return user!;
    } catch (error) {
      logger.error('Create user error:', error);
      throw createError('Failed to create user', 500);
    }
  }

  async createOrUpdateConnection(userId: number, connectionData: CreateConnectionData): Promise<void> {
    try {
      const providerResult = await this.db.get(
        'SELECT id FROM providers WHERE name = ?',
        [connectionData.provider]
      );

      if (!providerResult) {
        throw createError(`Provider ${connectionData.provider} not found`, 404);
      }

      const providerId = providerResult.id;
      const scopesString = connectionData.scopes.join(',');

      await this.db.run(
        `INSERT OR REPLACE INTO connections (user_id, provider_id, external_id, access_token, refresh_token, expires_at, scopes, status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
        [
          userId,
          providerId,
          connectionData.externalId,
          connectionData.accessToken,
          connectionData.refreshToken,
          connectionData.expiresAt?.toISOString(),
          scopesString
        ]
      );
    } catch (error) {
      logger.error('Create/update connection error:', error);
      throw createError('Failed to save connection', 500);
    }
  }

  async getUserConnections(userId: number): Promise<Connection[]> {
    try {
      const result = await this.db.all(
        `SELECT c.*, p.name as provider_name
         FROM connections c
         JOIN providers p ON c.provider_id = p.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`,
        [userId]
      );
      return result;
    } catch (error) {
      logger.error('Get user connections error:', error);
      throw createError('Failed to fetch connections', 500);
    }
  }

  async getConnection(userId: number, connectionId: number): Promise<Connection | null> {
    try {
      const result = await this.db.get(
        `SELECT c.*, p.name as provider_name
         FROM connections c
         JOIN providers p ON c.provider_id = p.id
         WHERE c.id = ? AND c.user_id = ?`,
        [connectionId, userId]
      );
      return result || null;
    } catch (error) {
      logger.error('Get connection error:', error);
      throw createError('Failed to fetch connection', 500);
    }
  }

  async deleteConnection(userId: number, connectionId: number): Promise<void> {
    try {
      const result = await this.db.run(
        'DELETE FROM connections WHERE id = ? AND user_id = ?',
        [connectionId, userId]
      );

      if (result.changes === 0) {
        throw createError('Connection not found', 404);
      }
    } catch (error) {
      logger.error('Delete connection error:', error);
      throw error;
    }
  }
}