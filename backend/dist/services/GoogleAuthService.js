"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const googleapis_1 = require("googleapis");
const axios_1 = __importDefault(require("axios"));
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class GoogleAuthService {
    constructor() {
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    }
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/calendar'
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }
    async exchangeCodeForTokens(code) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            if (!tokens.access_token) {
                throw (0, errorHandler_1.createError)('Failed to obtain access token', 500);
            }
            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || undefined,
                expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
                scope: tokens.scope,
                token_type: 'Bearer'
            };
        }
        catch (error) {
            logger_1.logger.error('Token exchange failed:', error);
            throw (0, errorHandler_1.createError)('Failed to exchange authorization code', 500);
        }
    }
    async getUserInfo(accessToken) {
        try {
            const response = await axios_1.default.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const { id, email, name, picture } = response.data;
            if (!id || !email || !name) {
                throw (0, errorHandler_1.createError)('Incomplete user information received', 500);
            }
            return { id, email, name, picture };
        }
        catch (error) {
            logger_1.logger.error('Failed to get user info:', error);
            throw (0, errorHandler_1.createError)('Failed to retrieve user information', 500);
        }
    }
    async refreshToken(refreshToken) {
        try {
            this.oauth2Client.setCredentials({
                refresh_token: refreshToken
            });
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            if (!credentials.access_token) {
                throw (0, errorHandler_1.createError)('Failed to refresh access token', 500);
            }
            return {
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || refreshToken,
                expires_in: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
                scope: credentials.scope,
                token_type: 'Bearer'
            };
        }
        catch (error) {
            logger_1.logger.error('Token refresh failed:', error);
            throw (0, errorHandler_1.createError)('Failed to refresh access token', 500);
        }
    }
    async revokeToken(accessToken) {
        try {
            await axios_1.default.post(`https://oauth2.googleapis.com/revoke?token=${accessToken}`);
        }
        catch (error) {
            logger_1.logger.error('Token revocation failed:', error);
            throw (0, errorHandler_1.createError)('Failed to revoke access token', 500);
        }
    }
}
exports.GoogleAuthService = GoogleAuthService;
//# sourceMappingURL=GoogleAuthService.js.map