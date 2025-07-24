"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const AdminService_1 = require("../services/AdminService");
const InternalAppService_1 = require("../services/InternalAppService");
const AuditService_1 = require("../services/AuditService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class AdminController {
    constructor() {
        this.adminService = new AdminService_1.AdminService();
        this.internalAppService = new InternalAppService_1.InternalAppService();
        this.auditService = new AuditService_1.AuditService();
        this.verifyPassword = async (req, res) => {
            try {
                const { password } = req.body;
                if (!password) {
                    throw (0, errorHandler_1.createError)('Password is required', 400);
                }
                const isValid = await this.adminService.verifyPassword(password);
                if (!isValid) {
                    await this.auditService.logEvent({
                        event_type: 'admin_login_failed',
                        user_identifier: 'admin',
                        ip_address: req.ip,
                        user_agent: req.get('User-Agent'),
                        success: false,
                        error_message: 'Invalid password'
                    });
                    throw (0, errorHandler_1.createError)('Invalid password', 401);
                }
                await this.auditService.logEvent({
                    event_type: 'admin_login_success',
                    user_identifier: 'admin',
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    success: true
                });
                res.json({ success: true, message: 'Admin authenticated' });
            }
            catch (error) {
                logger_1.logger.error('Admin password verification error:', error);
                throw error;
            }
        };
        this.getInternalApps = async (req, res) => {
            try {
                const apps = await this.internalAppService.getAllApps();
                res.json({ apps });
            }
            catch (error) {
                logger_1.logger.error('Get internal apps error:', error);
                throw (0, errorHandler_1.createError)('Failed to fetch internal apps', 500);
            }
        };
        this.createInternalApp = async (req, res) => {
            try {
                const { name, display_name, description, logo_url, api_endpoints, manifest_data } = req.body;
                const appData = {
                    name,
                    display_name,
                    description,
                    logo_url,
                    api_endpoints,
                    manifest_data
                };
                const app = await this.internalAppService.createApp(appData);
                await this.auditService.logEvent({
                    event_type: 'internal_app_created',
                    internal_app: name,
                    user_identifier: 'admin',
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    success: true,
                    details: JSON.stringify({ app_id: app.id })
                });
                res.json({ app, message: 'Internal app created successfully' });
            }
            catch (error) {
                logger_1.logger.error('Create internal app error:', error);
                throw (0, errorHandler_1.createError)('Failed to create internal app', 500);
            }
        };
        this.getAuthLogs = async (req, res) => {
            try {
                const { limit = 100, offset = 0, event_type } = req.query;
                const logs = await this.auditService.getLogs({
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    event_type: event_type
                });
                res.json({ logs });
            }
            catch (error) {
                logger_1.logger.error('Get auth logs error:', error);
                throw (0, errorHandler_1.createError)('Failed to fetch auth logs', 500);
            }
        };
        this.getLogStats = async (req, res) => {
            try {
                const stats = await this.auditService.getLogStats();
                res.json({ stats });
            }
            catch (error) {
                logger_1.logger.error('Get log stats error:', error);
                throw (0, errorHandler_1.createError)('Failed to fetch log statistics', 500);
            }
        };
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map