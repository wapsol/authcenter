import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function setCache(key: string, value: string, expiration?: number): Promise<void> {
  try {
    if (expiration) {
      await redisClient.setEx(key, expiration, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function getCache(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    logger.info('Redis connection closed');
  }
}