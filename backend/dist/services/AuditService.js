"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class AuditService {
    get db() {
        return (0, database_1.getDatabase)();
    }
    async logEvent(event) {
        try {
            await this.db.run(`INSERT INTO auth_events (
          event_type, external_app, internal_app, user_identifier,
          ip_address, user_agent, success, error_message, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                event.event_type,
                event.external_app,
                event.internal_app,
                event.user_identifier,
                event.ip_address,
                event.user_agent,
                event.success,
                event.error_message,
                event.details
            ]);
        }
        catch (error) {
            logger_1.logger.error('Log event error:', error);
            // Don't throw here to avoid breaking the main flow
        }
    }
    async getLogs(filter = {}) {
        try {
            const { limit = 100, offset = 0, event_type, success, start_date, end_date } = filter;
            let query = 'SELECT * FROM auth_events WHERE 1=1';
            const params = [];
            if (event_type) {
                query += ' AND event_type = ?';
                params.push(event_type);
            }
            if (success !== undefined) {
                query += ' AND success = ?';
                params.push(success);
            }
            if (start_date) {
                query += ' AND created_at >= ?';
                params.push(start_date);
            }
            if (end_date) {
                query += ' AND created_at <= ?';
                params.push(end_date);
            }
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            const result = await this.db.all(query, params);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get logs error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch logs', 500);
        }
    }
    async getLogStats() {
        try {
            const totalResult = await this.db.get('SELECT COUNT(*) as total FROM auth_events');
            const successResult = await this.db.get('SELECT COUNT(*) as success FROM auth_events WHERE success = 1');
            const failureResult = await this.db.get('SELECT COUNT(*) as failure FROM auth_events WHERE success = 0');
            const recentResult = await this.db.get(`SELECT COUNT(*) as recent FROM auth_events 
         WHERE created_at >= datetime('now', '-24 hours')`);
            const eventTypesResult = await this.db.all(`SELECT event_type, COUNT(*) as count 
         FROM auth_events 
         GROUP BY event_type 
         ORDER BY count DESC`);
            const eventTypes = {};
            eventTypesResult.forEach((row) => {
                eventTypes[row.event_type] = row.count;
            });
            return {
                total_events: totalResult.total,
                success_count: successResult.success,
                failure_count: failureResult.failure,
                recent_events: recentResult.recent,
                event_types: eventTypes
            };
        }
        catch (error) {
            logger_1.logger.error('Get log stats error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch log statistics', 500);
        }
    }
    async getRecentEvents(limit = 10) {
        try {
            const result = await this.db.all('SELECT * FROM auth_events ORDER BY created_at DESC LIMIT ?', [limit]);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get recent events error:', error);
            throw (0, errorHandler_1.createError)('Failed to fetch recent events', 500);
        }
    }
    async clearOldLogs(daysToKeep = 30) {
        try {
            const result = await this.db.run(`DELETE FROM auth_events 
         WHERE created_at < datetime('now', '-${daysToKeep} days')`);
            logger_1.logger.info(`Cleared ${result.changes} old log entries`);
            return result.changes || 0;
        }
        catch (error) {
            logger_1.logger.error('Clear old logs error:', error);
            throw (0, errorHandler_1.createError)('Failed to clear old logs', 500);
        }
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map