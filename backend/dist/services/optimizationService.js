"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceOptimizer = exports.createRateLimiter = exports.compressResponse = exports.optimizeImage = exports.optimizeDatabase = exports.PerformanceOptimizer = void 0;
const perf_hooks_1 = require("perf_hooks");
const redis_1 = __importDefault(require("redis"));
// Redis client for caching (optional)
const redis = process.env.REDIS_URL ? redis_1.default.createClient({ url: process.env.REDIS_URL }) : null;
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
    }
    static getInstance() {
        if (!PerformanceOptimizer.instance) {
            PerformanceOptimizer.instance = new PerformanceOptimizer();
        }
        return PerformanceOptimizer.instance;
    }
    // Memory cache with TTL
    async setCache(key, data, ttlSeconds = 300) {
        const expiry = Date.now() + (ttlSeconds * 1000);
        if (redis) {
            await redis.setEx(key, ttlSeconds, JSON.stringify(data));
        }
        else {
            this.cache.set(key, { data, expiry });
        }
    }
    async getCache(key) {
        if (redis) {
            const cached = await redis.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        else {
            const cached = this.cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                return cached.data;
            }
            this.cache.delete(key);
            return null;
        }
    }
    // Database query optimization
    optimizeQuery(query, options = {}) {
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
    async measurePerformance(operation, fn) {
        const start = perf_hooks_1.performance.now();
        const result = await fn();
        const duration = perf_hooks_1.performance.now() - start;
        // Log slow operations
        if (duration > 1000) {
            console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
        }
        return { result, duration };
    }
    // Batch operations
    async batchProcess(items, processor, batchSize = 100) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await processor(batch);
            results.push(...batchResults);
        }
        return results;
    }
    // Memory usage monitoring
    getMemoryUsage() {
        return process.memoryUsage();
    }
    // Cleanup expired cache entries
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.expiry <= now) {
                this.cache.delete(key);
            }
        }
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
// Database connection optimization
const optimizeDatabase = () => {
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
exports.optimizeDatabase = optimizeDatabase;
// Image optimization
const optimizeImage = async (imageBuffer, options = {}) => {
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
exports.optimizeImage = optimizeImage;
// API response compression
const compressResponse = (data) => {
    const zlib = require('zlib');
    return zlib.gzipSync(JSON.stringify(data)).toString('base64');
};
exports.compressResponse = compressResponse;
// Rate limiting helper
const createRateLimiter = (windowMs, max) => {
    const requests = new Map();
    return (identifier) => {
        const now = Date.now();
        const windowStart = now - windowMs;
        if (!requests.has(identifier)) {
            requests.set(identifier, []);
        }
        const userRequests = requests.get(identifier);
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
exports.createRateLimiter = createRateLimiter;
exports.performanceOptimizer = PerformanceOptimizer.getInstance();
