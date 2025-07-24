"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw (0, errorHandler_1.createError)('Access token required', 401);
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Token verification failed:', error);
        throw (0, errorHandler_1.createError)('Invalid or expired token', 401);
    }
}
function generateToken(userId, email) {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    return jsonwebtoken_1.default.sign({ userId, email }, jwtSecret, { expiresIn });
}
//# sourceMappingURL=auth.js.map