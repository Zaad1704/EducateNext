import { performance } from 'perf_hooks';
import Redis from 'redis';

// Redis client for caching (optional)
const redis = process.env.REDIS_URL ? Redis.createClient({ url: process.env.REDIS_URL }) : null;

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache = new Map<string, { data: any; expiry: number }>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Memory cache with TTL
  async setCache(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    const expiry = Date.now() + (ttlSeconds * 1000);
    
    if (redis) {
      await redis.setEx(key, ttlSeconds, JSON.stringify(data));
    } else {
      this.cache.set(key, { data, expiry });
    }
  }

  async getCache(key: string): Promise<any> {
    if (redis) {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } else {
      const cached = this.cache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      this.cache.delete(key);
      return null;
    }
  }

  // Database query optimization
  optimizeQuery(query: any, options: any = {}): any {
    // Add lean() for better performance on read operations
    if (query.lean && !options.populate) {
      query = query.lean();
    }

    // Add select() to limit fields
    if (options.select) {
      query = query.select(options.select);
    }

    // Add pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.skip) {
      query = query.skip(options.skip);
    }

    return query;
  }

  // Performance monitoring
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }

  // Batch operations
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 100
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  // Memory usage monitoring
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // Cleanup expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
}

// Database connection optimization
export const optimizeDatabase = () => {
  // Connection pooling settings
  return {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
};

// Image optimization
export const optimizeImage = async (imageBuffer: Buffer, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
} = {}): Promise<Buffer> => {
  const sharp = require('sharp');
  
  let pipeline = sharp(imageBuffer);

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  if (options.format) {
    switch (options.format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: options.quality || 80 });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: options.quality || 80 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: options.quality || 80 });
        break;
    }
  }

  return pipeline.toBuffer();
};

// API response compression
export const compressResponse = (data: any): string => {
  const zlib = require('zlib');
  return zlib.gzipSync(JSON.stringify(data)).toString('base64');
};

// Rate limiting helper
export const createRateLimiter = (windowMs: number, max: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }

    const userRequests = requests.get(identifier)!;
    
    // Remove old requests
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(identifier, validRequests);

    if (validRequests.length >= max) {
      return false; // Rate limit exceeded
    }

    validRequests.push(now);
    return true; // Request allowed
  };
};

export const performanceOptimizer = PerformanceOptimizer.getInstance();