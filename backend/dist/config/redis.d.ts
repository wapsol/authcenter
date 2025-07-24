export declare function connectRedis(): Promise<void>;
export declare function getRedisClient(): any;
export declare function setCache(key: string, value: string, expiration?: number): Promise<void>;
export declare function getCache(key: string): Promise<string | null>;
export declare function deleteCache(key: string): Promise<void>;
export declare function closeRedis(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map