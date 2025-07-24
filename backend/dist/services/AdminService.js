"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class AdminService {
    get db() {
        return (0, database_1.getDatabase)();
    }
    async verifyPassword(password) {
        try {
            const admin = await this.db.get('SELECT password_hash FROM admin_config WHERE id = 1');
            if (!admin) {
                logger_1.logger.error('Admin configuration not found');
                return false;
            }
            return bcryptjs_1.default.compareSync(password, admin.password_hash);
        }
        catch (error) {
            logger_1.logger.error('Password verification error:', error);
            return false;
        }
    }
    async updatePassword(currentPassword, newPassword) {
        try {
            const isCurrentValid = await this.verifyPassword(currentPassword);
            if (!isCurrentValid) {
                throw (0, errorHandler_1.createError)('Current password is invalid', 401);
            }
            const newPasswordHash = bcryptjs_1.default.hashSync(newPassword, 10);
            await this.db.run('UPDATE admin_config SET password_hash = ? WHERE id = 1', [newPasswordHash]);
            logger_1.logger.info('Admin password updated successfully');
        }
        catch (error) {
            logger_1.logger.error('Password update error:', error);
            throw error;
        }
    }
    async getAdminConfig() {
        try {
            const admin = await this.db.get('SELECT id, username, created_at FROM admin_config WHERE id = 1');
            return admin || null;
        }
        catch (error) {
            logger_1.logger.error('Get admin config error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch admin configuration', 500);
        }
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=AdminService.js.map