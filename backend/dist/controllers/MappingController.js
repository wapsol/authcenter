"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingController = void 0;
const InternalAppService_1 = require("../services/InternalAppService");
const AuditService_1 = require("../services/AuditService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class MappingController {
    constructor() {
        this.internalAppService = new InternalAppService_1.InternalAppService();
        this.auditService = new AuditService_1.AuditService();
        this.getInternalApps = async (req, res) => {
            try {
                const apps = await this.internalAppService.getAllApps();
                res.json({ apps });
            }
            catch (error) {
                logger_1.logger.error('Get internal apps error:', error);
                throw error;
            }
        };
        this.getMappings = async (req, res) => {
            try {
                const mappings = await this.internalAppService.getMappings();
                res.json({ mappings });
            }
            catch (error) {
                logger_1.logger.error('Get mappings error:', error);
                throw error;
            }
        };
        this.createMapping = async (req, res) => {
            try {
                const { external_provider_id, internal_app_id, connection_id } = req.body;
                if (!external_provider_id || !internal_app_id || !connection_id) {
                    throw (0, errorHandler_1.createError)('Missing required fields', 400);
                }
                const mapping = await this.internalAppService.createMapping(external_provider_id, internal_app_id, connection_id);
                await this.auditService.logEvent({
                    event_type: 'mapping_created',
                    user_identifier: 'user', // We'll improve this when user auth is added
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    success: true,
                    details: JSON.stringify({
                        mapping_id: mapping.id,
                        external_provider_id,
                        internal_app_id,
                        connection_id
                    })
                });
                res.json({ mapping, message: 'App mapping created successfully' });
            }
            catch (error) {
                logger_1.logger.error('Create mapping error:', error);
                await this.auditService.logEvent({
                    event_type: 'mapping_failed',
                    user_identifier: 'user',
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    success: false,
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                });
                throw error;
            }
        };
        this.deleteMapping = async (req, res) => {
            try {
                const { id } = req.params;
                await this.internalAppService.deleteMapping(parseInt(id));
                await this.auditService.logEvent({
                    event_type: 'mapping_deleted',
                    user_identifier: 'user',
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    success: true,
                    details: JSON.stringify({ mapping_id: id })
                });
                res.json({ message: 'App mapping deleted successfully' });
            }
            catch (error) {
                logger_1.logger.error('Delete mapping error:', error);
                throw error;
            }
        };
    }
}
exports.MappingController = MappingController;
//# sourceMappingURL=MappingController.js.map