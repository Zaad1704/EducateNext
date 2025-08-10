import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import CacheService from '../config/redis';
import { logger } from '../utils/logger';

// Generate cache key from request
const generateCacheKey = (req: Request): string => {
  const { method, originalUrl, user } = req;
  const userId = user?.id || 'anonymous';
  const queryString = JSON.stringify(req.query);
  const bodyString = method === 'POST' ? JSON.stringify(req.body) : '';
  
  const keyData = `${method}:${originalUrl}:${userId}:${queryString}:${bodyString}`;
  return crypto.createHash('md5').update(keyData).digest('hex');
};

// Cache middleware factory
export const cacheMiddleware = (ttl: number = 300, skipCache: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or when explicitly disabled
    if (req.method !== 'GET' || skipCache) {
      return next();
    }

    const cacheKey = `api:${generateCacheKey(req)}`;
    
    try {
      // Try to get from cache
      const cached = await CacheService.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json(cached);
      }

      // Cache miss - intercept response
      const originalSend = res.json;
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(cacheKey, data, ttl).catch(error => {
            logger.error('Cache set error:', error);
          });
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original response methods
    const originalSend = res.json;
    
    res.json = function(data: any) {
      // Invalidate cache patterns after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => {
          CacheService.clearPattern(pattern).catch(error => {
            logger.error('Cache invalidation error:', error);
          });
        });
      }
      
      return originalSend.call(this, data);
    };

    next();
  };
};

// Specific cache strategies
export const cacheStrategies = {
  // Short-term cache for frequently accessed data
  shortTerm: cacheMiddleware(60), // 1 minute
  
  // Medium-term cache for semi-static data
  mediumTerm: cacheMiddleware(300), // 5 minutes
  
  // Long-term cache for static data
  longTerm: cacheMiddleware(3600), // 1 hour
  
  // User-specific cache
  userSpecific: cacheMiddleware(600), // 10 minutes
  
  // Analytics cache (longer duration)
  analytics: cacheMiddleware(1800) // 30 minutes
};

// Cache warming utilities
export const warmCache = {
  // Warm frequently accessed data
  async warmFrequentData(): Promise<void> {
    try {
      logger.info('Starting cache warming...');
      // Implementation would depend on specific data patterns
      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Cache warming error:', error);
    }
  }
};