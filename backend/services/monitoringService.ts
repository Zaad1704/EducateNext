import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { redis } from '../config/redis';

export class MonitoringService {
  static async checkSystemHealth(): Promise<any> {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        memory: this.checkMemory(),
        disk: await this.checkDisk()
      }
    };

    if (Object.values(health.services).some(s => s.status !== 'healthy')) {
      health.status = 'unhealthy';
    }

    return health;
  }

  private static async checkDatabase(): Promise<any> {
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private static async checkRedis(): Promise<any> {
    try {
      const start = Date.now();
      await redis.ping();
      return { status: 'healthy', responseTime: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private static checkMemory(): any {
    const usage = process.memoryUsage();
    const threshold = 1024 * 1024 * 1024; // 1GB
    
    return {
      status: usage.heapUsed < threshold ? 'healthy' : 'warning',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024)
    };
  }

  private static async checkDisk(): Promise<any> {
    try {
      const fs = require('fs').promises;
      const stats = await fs.stat('.');
      return { status: 'healthy', available: true };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  static async sendAlert(message: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    logger.warn(`ALERT [${severity.toUpperCase()}]: ${message}`);
    
    // In production, integrate with alerting services like PagerDuty, Slack, etc.
    if (severity === 'high') {
      // Send immediate notification
      console.error(`🚨 HIGH SEVERITY ALERT: ${message}`);
    }
  }
}