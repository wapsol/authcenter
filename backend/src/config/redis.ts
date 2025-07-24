import { logger } from '../utils/logger';

// Simple in-memory cache for demo (replace with Redis in production)
const cache = new Map<string, { value: string; expiry?: number }>();

export async function connectRedis(): Promise<void> {
  try {
    logger.info('Using in-memory cache (Redis disabled for demo)');
  } catch (error) {
    logger.error('Cache initialization failed:', error);
    throw error;
  }
}

export function getRedisClient(): any {
  return cache;
}

export async function setCache(key: string, value: string, expiration?: number): Promise<void> {
  try {
    const expiry = expiration ? Date.now() + (expiration * 1000) : undefined;
    cache.set(key, { value, expiry });
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function getCache(key: string): Promise<string | null> {
  try {
    const cached = cache.get(key);
    if (!cached) return null;
    if (cached.expiry && Date.now() > cached.expiry) {
      cache.delete(key);
      return null;
    }
    return cached.value;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    cache.delete(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function closeRedis(): Promise<void> {
  cache.clear();
  logger.info('Cache cleared');
}