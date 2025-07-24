"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class UserService {
    get db() {
        return (0, database_1.getDatabase)();
    }
    async findByEmail(email) {
        try {
            const result = await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
            return result || null;
        }
        catch (error) {
            logger_1.logger.error('Find user by email error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async findById(id) {
        try {
            const result = await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
            return result || null;
        }
        catch (error) {
            logger_1.logger.error('Find user by ID error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async create(userData) {
        try {
            const result = await this.db.run('INSERT INTO users (email, name) VALUES (?, ?)', [userData.email, userData.name]);
            const user = await this.db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
            return user;
        }
        catch (error) {
            logger_1.logger.error('Create user error:', error);
            throw (0, errorHandler_1.createError)('Failed to create user', 500);
        }
    }
    async createOrUpdateConnection(userId, connectionData) {
        try {
            const providerResult = await this.db.get('SELECT id FROM providers WHERE name = ?', [connectionData.provider]);
            if (!providerResult) {
                throw (0, errorHandler_1.createError)(`Provider ${connectionData.provider} not found`, 404);
            }
            const providerId = providerResult.id;
            const scopesString = connectionData.scopes.join(',');
            await this.db.run(`INSERT OR REPLACE INTO connections (user_id, provider_id, external_id, access_token, refresh_token, expires_at, scopes, status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`, [
                userId,
                providerId,
                connectionData.externalId,
                connectionData.accessToken,
                connectionData.refreshToken,
                connectionData.expiresAt?.toISOString(),
                scopesString
            ]);
        }
        catch (error) {
            logger_1.logger.error('Create/update connection error:', error);
            throw (0, errorHandler_1.createError)('Failed to save connection', 500);
        }
    }
    async getUserConnections(userId) {
        try {
            const result = await this.db.all(`SELECT c.*, p.name as provider_name
         FROM connections c
         JOIN providers p ON c.provider_id = p.id
         WHERE c.user_id = ?
         ORDER BY c.created_at DESC`, [userId]);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get user connections error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch connections', 500);
        }
    }
    async getConnection(userId, connectionId) {
        try {
            const result = await this.db.get(`SELECT c.*, p.name as provider_name
         FROM connections c
         JOIN providers p ON c.provider_id = p.id
         WHERE c.id = ? AND c.user_id = ?`, [connectionId, userId]);
            return result || null;
        }
        catch (error) {
            logger_1.logger.error('Get connection error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch connection', 500);
        }
    }
    async deleteConnection(userId, connectionId) {
        try {
            const result = await this.db.run('DELETE FROM connections WHERE id = ? AND user_id = ?', [connectionId, userId]);
            if (result.changes === 0) {
                throw (0, errorHandler_1.createError)('Connection not found', 404);
            }
        }
        catch (error) {
            logger_1.logger.error('Delete connection error:', error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map