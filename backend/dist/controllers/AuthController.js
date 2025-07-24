"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const GoogleAuthService_1 = require("../services/GoogleAuthService");
const UserService_1 = require("../services/UserService");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class AuthController {
    constructor() {
        this.googleAuthService = new GoogleAuthService_1.GoogleAuthService();
        this.userService = new UserService_1.UserService();
        this.initiateGoogleAuth = async (req, res) => {
            try {
                const authUrl = this.googleAuthService.getAuthUrl();
                res.json({ authUrl });
            }
            catch (error) {
                logger_1.logger.error('Failed to initiate Google auth:', error);
                throw (0, errorHandler_1.createError)('Failed to initiate authentication', 500);
            }
        };
        this.handleGoogleCallback = async (req, res) => {
            try {
                const { code, state, error } = req.query;
                if (error) {
                    throw (0, errorHandler_1.createError)(`Authentication failed: ${error}`, 400);
                }
                if (!code || typeof code !== 'string') {
                    throw (0, errorHandler_1.createError)('Authorization code is required', 400);
                }
                const tokens = await this.googleAuthService.exchangeCodeForTokens(code);
                const userInfo = await this.googleAuthService.getUserInfo(tokens.access_token);
                let user = await this.userService.findByEmail(userInfo.email);
                if (!user) {
                    user = await this.userService.create({
                        email: userInfo.email,
                        name: userInfo.name
                    });
                }
                await this.userService.createOrUpdateConnection(user.id, {
                    provider: 'google',
                    externalId: userInfo.id,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
                    scopes: tokens.scope?.split(' ') || []
                });
                const jwtToken = (0, auth_1.generateToken)(user.id, user.email);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
            }
            catch (error) {
                logger_1.logger.error('Google callback error:', error);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
            }
        };
        this.logout = async (req, res) => {
            res.json({ message: 'Logged out successfully' });
        };
        this.getCurrentUser = async (req, res) => {
            try {
                if (!req.user) {
                    throw (0, errorHandler_1.createError)('User not authenticated', 401);
                }
                const user = await this.userService.findById(req.user.id);
                if (!user) {
                    throw (0, errorHandler_1.createError)('User not found', 404);
                }
                const connections = await this.userService.getUserConnections(user.id);
                res.json({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    },
                    connections: connections.map(conn => ({
                        id: conn.id,
                        provider: conn.provider_name,
                        status: conn.status,
                        createdAt: conn.created_at
                    }))
                });
            }
            catch (error) {
                logger_1.logger.error('Get current user error:', error);
                throw error;
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map