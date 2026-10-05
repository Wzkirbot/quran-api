import { LRUCache } from 'lru-cache';
import Redis from 'ioredis';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

class CacheService {
  private memoryCache: LRUCache<string, string>;
  private redisClient: Redis | null = null;
  private isRedisConnected = false;

  constructor() {
    // High performance in-memory LRU cache fallback
    this.memoryCache = new LRUCache<string, string>({
      max: 5000, // Maximum 5,000 cached items
      ttl: config.cache.ttlDefault * 1000 // Convert to milliseconds
    });

    if (config.redis.enabled && config.redis.url) {
      try {
        this.redisClient = new Redis(config.redis.url, {
          lazyConnect: true,
          retryStrategy: (times) => Math.min(times * 100, 3000),
          maxRetriesPerRequest: 1
        });

        this.redisClient.connect().then(() => {
          this.isRedisConnected = true;
          logger.info('Connected to Redis Cache successfully.');
        }).catch((err) => {
          this.isRedisConnected = false;
          logger.warn(`Redis connection failed (${err.message}). Using In-Memory LRU Cache.`);
        });

        this.redisClient.on('error', (err) => {
          this.isRedisConnected = false;
          logger.warn(`Redis error: ${err.message}. Operating with In-Memory LRU Cache.`);
        });

        this.redisClient.on('ready', () => {
          this.isRedisConnected = true;
        });
      } catch (err: any) {
        logger.warn(`Failed to initialize Redis client (${err.message}). Falling back to memory.`);
      }
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const val = await this.redisClient.get(key);
        if (val) return JSON.parse(val) as T;
      }
    } catch (err: any) {
      logger.debug(`Redis read error on key ${key}: ${err.message}. Checking memory cache.`);
    }

    // Check memory cache
    const memVal = this.memoryCache.get(key);
    if (memVal) {
      try {
        return JSON.parse(memVal) as T;
      } catch {
        return null;
      }
    }

    return null;
  }

  public async set<T>(key: string, value: T, ttlSeconds: number = config.cache.ttlDefault): Promise<void> {
    const serialized = JSON.stringify(value);

    // Save in memory cache
    this.memoryCache.set(key, serialized, { ttl: ttlSeconds * 1000 });

    // Save in Redis if available
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setex(key, ttlSeconds, serialized);
      }
    } catch (err: any) {
      logger.debug(`Redis set error on key ${key}: ${err.message}`);
    }
  }

  public async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
      }
    } catch (err: any) {
      logger.debug(`Redis del error on key ${key}: ${err.message}`);
    }
  }

  public getStatus(): { provider: 'redis' | 'memory'; connected: boolean; memoryEntries: number } {
    return {
      provider: this.isRedisConnected ? 'redis' : 'memory',
      connected: this.isRedisConnected,
      memoryEntries: this.memoryCache.size
    };
  }
}

export const cache = new CacheService();
