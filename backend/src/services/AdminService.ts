import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface AdminConfig {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export class AdminService {
  private get db() {
    return getDatabase();
  }

  async verifyPassword(password: string): Promise<boolean> {
    try {
      const admin = await this.db.get(
        'SELECT password_hash FROM admin_config WHERE id = 1'
      );

      if (!admin) {
        logger.error('Admin configuration not found');
        return false;
      }

      return bcrypt.compareSync(password, admin.password_hash);
    } catch (error) {
      logger.error('Password verification error:', error);
      return false;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const isCurrentValid = await this.verifyPassword(currentPassword);
      
      if (!isCurrentValid) {
        throw createError('Current password is invalid', 401);
      }

      const newPasswordHash = bcrypt.hashSync(newPassword, 10);
      
      await this.db.run(
        'UPDATE admin_config SET password_hash = ? WHERE id = 1',
        [newPasswordHash]
      );

      logger.info('Admin password updated successfully');
    } catch (error) {
      logger.error('Password update error:', error);
      throw error;
    }
  }

  async getAdminConfig(): Promise<AdminConfig | null> {
    try {
      const admin = await this.db.get(
        'SELECT id, username, created_at FROM admin_config WHERE id = 1'
      );
      return admin || null;
    } catch (error) {
      logger.error('Get admin config error:', error);
      throw createError('Failed to fetch admin configuration', 500);
    }
  }
}