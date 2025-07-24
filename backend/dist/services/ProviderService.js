"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class ProviderService {
    get db() {
        return (0, database_1.getDatabase)();
    }
    async getAllProviders() {
        try {
            const result = await this.db.all('SELECT * FROM providers WHERE enabled = 1 ORDER BY display_name');
            return result.map(row => ({
                ...row,
                oauth_config: JSON.parse(row.oauth_config),
                scopes: row.scopes.split(',')
            }));
        }
        catch (error) {
            logger_1.logger.error('Get all providers error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async getProviderById(id) {
        try {
            const result = await this.db.get('SELECT * FROM providers WHERE id = ?', [id]);
            if (!result)
                return null;
            return {
                ...result,
                oauth_config: JSON.parse(result.oauth_config),
                scopes: result.scopes.split(',')
            };
        }
        catch (error) {
            logger_1.logger.error('Get provider by ID error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async getProviderByName(name) {
        try {
            const result = await this.db.get('SELECT * FROM providers WHERE name = ?', [name]);
            if (!result)
                return null;
            return {
                ...result,
                oauth_config: JSON.parse(result.oauth_config),
                scopes: result.scopes.split(',')
            };
        }
        catch (error) {
            logger_1.logger.error('Get provider by name error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
}
exports.ProviderService = ProviderService;
//# sourceMappingURL=ProviderService.js.map