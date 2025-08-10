import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import CacheService from '../config/redis';
import { logger } from '../utils/logger';

// Performance metrics interface
interface PerformanceMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  dbConnections: number;
  cacheHitRate?: number;
}

// Performance monitoring service
export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000;

  private constructor() {}

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Record performance metric
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (metric.responseTime > 1000) {
      logger.warn('Slow request detected', {
        endpoint: metric.endpoint,
        method: metric.method,
        responseTime: metric.responseTime,
        statusCode: metric.statusCode
      });
    }
  }

  // Get performance statistics
  getStats(): any {
    if (this.metrics.length === 0) return null;

    const responseTimes = this.metrics.map(m => m.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);

    const statusCodes = this.metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalRequests: this.metrics.length,
      avgResponseTime: Math.round(avgResponseTime),
      maxResponseTime,
      minResponseTime,
      statusCodes,
      errorRate: ((statusCodes[500] || 0) / this.metrics.length * 100).toFixed(2),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  // Get database performance
  async getDatabaseStats(): Promise<any> {
    try {
      const dbStats = await mongoose.connection.db.stats();
      const connectionStats = {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };

      return {
        ...dbStats,
        connection: connectionStats
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      return null;
    }
  }

  // Get cache performance
  async getCacheStats(): Promise<any> {
    try {
      return await CacheService.getStats();
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Performance monitoring middleware
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const endMemory = process.memoryUsage();

    // Record performance metric
    const metric: PerformanceMetrics = {
      timestamp: new Date(),
      endpoint: req.originalUrl,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
      },
      dbConnections: mongoose.connections.length
    };

    PerformanceService.getInstance().recordMetric(metric);

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

// Health check endpoint data
export const getHealthCheck = async (): Promise<any> => {
  const performanceService = PerformanceService.getInstance();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    performance: performanceService.getStats(),
    database: await performanceService.getDatabaseStats(),
    cache: await performanceService.getCacheStats(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
};

export default PerformanceService.getInstance();