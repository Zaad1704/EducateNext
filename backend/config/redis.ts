import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('Redis ready for operations');
});

// Cache service class
export class CacheService {
  private static instance: CacheService;
  private client: Redis;

  private constructor() {
    this.client = redis;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Set cache with TTL
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  // Get cache
  async get(key: string): Promise<any | null> {
    try {
      const cached = await this.client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Cache clear pattern error:', error);
    }
  }

  // Cache statistics
  async getStats(): Promise<any> {
    try {
      const info = await this.client.info('stats');
      return info;
    } catch (error) {
      logger.error('Cache stats error:', error);
      return null;
    }
  }
}

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  student: (id: string) => `student:${id}`,
  teacher: (id: string) => `teacher:${id}`,
  classroom: (id: string) => `classroom:${id}`,
  attendance: (studentId: string, date: string) => `attendance:${studentId}:${date}`,
  grades: (studentId: string, period: string) => `grades:${studentId}:${period}`,
  institution: (id: string) => `institution:${id}`,
  analytics: (type: string, id: string) => `analytics:${type}:${id}`,
  session: (sessionId: string) => `session:${sessionId}`
};

export default CacheService.getInstance();