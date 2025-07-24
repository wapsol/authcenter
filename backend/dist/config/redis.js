"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.getRedisClient = getRedisClient;
exports.setCache = setCache;
exports.getCache = getCache;
exports.deleteCache = deleteCache;
exports.closeRedis = closeRedis;
const logger_1 = require("../utils/logger");
// Simple in-memory cache for demo (replace with Redis in production)
const cache = new Map();
async function connectRedis() {
    try {
        logger_1.logger.info('Using in-memory cache (Redis disabled for demo)');
    }
    catch (error) {
        logger_1.logger.error('Cache initialization failed:', error);
        throw error;
    }
}
function getRedisClient() {
    return cache;
}
async function setCache(key, value, expiration) {
    try {
        const expiry = expiration ? Date.now() + (expiration * 1000) : undefined;
        cache.set(key, { value, expiry });
    }
    catch (error) {
        logger_1.logger.error('Cache set error:', error);
    }
}
async function getCache(key) {
    try {
        const cached = cache.get(key);
        if (!cached)
            return null;
        if (cached.expiry && Date.now() > cached.expiry) {
            cache.delete(key);
            return null;
        }
        return cached.value;
    }
    catch (error) {
        logger_1.logger.error('Cache get error:', error);
        return null;
    }
}
async function deleteCache(key) {
    try {
        cache.delete(key);
    }
    catch (error) {
        logger_1.logger.error('Cache delete error:', error);
    }
}
async function closeRedis() {
    cache.clear();
    logger_1.logger.info('Cache cleared');
}
//# sourceMappingURL=redis.js.map