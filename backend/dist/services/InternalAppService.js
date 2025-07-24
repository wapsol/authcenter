"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalAppService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class InternalAppService {
    get db() {
        return (0, database_1.getDatabase)();
    }
    async getAllApps() {
        try {
            const result = await this.db.all('SELECT * FROM internal_apps WHERE status = ? ORDER BY display_name', ['active']);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get all internal apps error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async getAppById(id) {
        try {
            const result = await this.db.get('SELECT * FROM internal_apps WHERE id = ?', [id]);
            return result || null;
        }
        catch (error) {
            logger_1.logger.error('Get internal app by ID error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async getAppByName(name) {
        try {
            const result = await this.db.get('SELECT * FROM internal_apps WHERE name = ?', [name]);
            return result || null;
        }
        catch (error) {
            logger_1.logger.error('Get internal app by name error:', error);
            throw (0, errorHandler_1.createError)('Database query failed', 500);
        }
    }
    async createApp(appData) {
        try {
            // Check if app name already exists
            const existing = await this.getAppByName(appData.name);
            if (existing) {
                throw (0, errorHandler_1.createError)('App with this name already exists', 409);
            }
            const result = await this.db.run(`INSERT INTO internal_apps (name, display_name, description, logo_url, api_endpoints, manifest_data)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                appData.name,
                appData.display_name,
                appData.description,
                appData.logo_url,
                appData.api_endpoints,
                appData.manifest_data
            ]);
            const app = await this.db.get('SELECT * FROM internal_apps WHERE id = ?', [result.lastID]);
            return app;
        }
        catch (error) {
            logger_1.logger.error('Create internal app error:', error);
            throw error;
        }
    }
    async updateApp(id, appData) {
        try {
            const existing = await this.getAppById(id);
            if (!existing) {
                throw (0, errorHandler_1.createError)('Internal app not found', 404);
            }
            const updates = Object.entries(appData)
                .filter(([_, value]) => value !== undefined)
                .map(([key]) => `${key} = ?`);
            if (updates.length === 0) {
                return existing;
            }
            const values = Object.values(appData).filter(value => value !== undefined);
            values.push(id);
            await this.db.run(`UPDATE internal_apps SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
            const updatedApp = await this.getAppById(id);
            return updatedApp;
        }
        catch (error) {
            logger_1.logger.error('Update internal app error:', error);
            throw error;
        }
    }
    async deleteApp(id) {
        try {
            const result = await this.db.run('UPDATE internal_apps SET status = ? WHERE id = ?', ['deleted', id]);
            if (result.changes === 0) {
                throw (0, errorHandler_1.createError)('Internal app not found', 404);
            }
        }
        catch (error) {
            logger_1.logger.error('Delete internal app error:', error);
            throw error;
        }
    }
    async createMapping(externalProviderId, internalAppId, connectionId) {
        try {
            const result = await this.db.run(`INSERT INTO app_mappings (external_provider_id, internal_app_id, connection_id)
         VALUES (?, ?, ?)`, [externalProviderId, internalAppId, connectionId]);
            const mapping = await this.db.get('SELECT * FROM app_mappings WHERE id = ?', [result.lastID]);
            return mapping;
        }
        catch (error) {
            logger_1.logger.error('Create app mapping error:', error);
            throw (0, errorHandler_1.createError)('Failed to create app mapping', 500);
        }
    }
    async getMappings() {
        try {
            const result = await this.db.all(`SELECT 
           am.*,
           p.display_name as external_provider_name,
           ia.display_name as internal_app_name
         FROM app_mappings am
         JOIN providers p ON am.external_provider_id = p.id
         JOIN internal_apps ia ON am.internal_app_id = ia.id
         ORDER BY am.created_at DESC`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get app mappings error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch app mappings', 500);
        }
    }
    async deleteMapping(id) {
        try {
            const result = await this.db.run('DELETE FROM app_mappings WHERE id = ?', [id]);
            if (result.changes === 0) {
                throw (0, errorHandler_1.createError)('App mapping not found', 404);
            }
        }
        catch (error) {
            logger_1.logger.error('Delete app mapping error:', error);
            throw error;
        }
    }
}
exports.InternalAppService = InternalAppService;
//# sourceMappingURL=InternalAppService.js.map