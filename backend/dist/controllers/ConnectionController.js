"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionController = void 0;
const UserService_1 = require("../services/UserService");
const GoogleAuthService_1 = require("../services/GoogleAuthService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class ConnectionController {
    constructor() {
        this.userService = new UserService_1.UserService();
        this.googleAuthService = new GoogleAuthService_1.GoogleAuthService();
        this.getUserConnections = async (req, res) => {
            try {
                if (!req.user) {
                    throw (0, errorHandler_1.createError)('User not authenticated', 401);
                }
                const connections = await this.userService.getUserConnections(req.user.id);
                res.json({ connections });
            }
            catch (error) {
                logger_1.logger.error('Get user connections error:', error);
                throw error;
            }
        };
        this.getConnection = async (req, res) => {
            try {
                if (!req.user) {
                    throw (0, errorHandler_1.createError)('User not authenticated', 401);
                }
                const { id } = req.params;
                const connection = await this.userService.getConnection(req.user.id, parseInt(id));
                if (!connection) {
                    throw (0, errorHandler_1.createError)('Connection not found', 404);
                }
                res.json({ connection });
            }
            catch (error) {
                logger_1.logger.error('Get connection error:', error);
                throw error;
            }
        };
        this.deleteConnection = async (req, res) => {
            try {
                if (!req.user) {
                    throw (0, errorHandler_1.createError)('User not authenticated', 401);
                }
                const { id } = req.params;
                await this.userService.deleteConnection(req.user.id, parseInt(id));
                res.json({ message: 'Connection deleted successfully' });
            }
            catch (error) {
                logger_1.logger.error('Delete connection error:', error);
                throw error;
            }
        };
        this.refreshConnection = async (req, res) => {
            try {
                if (!req.user) {
                    throw (0, errorHandler_1.createError)('User not authenticated', 401);
                }
                const { id } = req.params;
                const connection = await this.userService.getConnection(req.user.id, parseInt(id));
                if (!connection) {
                    throw (0, errorHandler_1.createError)('Connection not found', 404);
                }
                if (connection.provider_name === 'google') {
                    // Refresh would be implemented here
                    res.json({ message: 'Connection refresh initiated' });
                }
                else {
                    throw (0, errorHandler_1.createError)('Provider not supported for refresh', 400);
                }
            }
            catch (error) {
                logger_1.logger.error('Refresh connection error:', error);
                throw error;
            }
        };
    }
}
exports.ConnectionController = ConnectionController;
//# sourceMappingURL=ConnectionController.js.map