import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { ValidationError } from './errorHandler';

// Enhanced rate limiting with different tiers
export const rateLimiters = {
  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      error: 'Too many authentication attempts',
      code: 'RATE_LIMIT_AUTH',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Auth rate limit exceeded', {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      res.status(429).json({
        error: 'Too many authentication attempts',
        code: 'RATE_LIMIT_AUTH',
        retryAfter: '15 minutes'
      });
    }
  }),

  // General API rate limiting
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Too many requests',
      code: 'RATE_LIMIT_API',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Strict rate limiting for sensitive operations
  sensitive: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: {
      error: 'Too many sensitive operations',
      code: 'RATE_LIMIT_SENSITIVE',
      retryAfter: '1 hour'
    }
  })
};

// Enhanced helmet configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Sanitize object recursively
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[sanitizeString(key)] = sanitizeObject(value);
  }
  return sanitized;
};

// Sanitize string values
const sanitizeString = (value: any): any => {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// SQL injection prevention
export const preventSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\)|(\/\*)|(\\*\/))/gi,
    /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi
  ];

  const checkForSQLInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSQLInjection);
    }
    
    return false;
  };

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
    logger.warn('SQL injection attempt detected', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: req.body,
      query: req.query
    });
    
    return next(new ValidationError('Invalid input detected'));
  }

  next();
};

// XSS prevention
export const preventXSS = (req: Request, res: Response, next: NextFunction): void => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
  ];

  const checkForXSS = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return xssPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForXSS);
    }
    
    return false;
  };

  if (checkForXSS(req.body) || checkForXSS(req.query)) {
    logger.warn('XSS attempt detected', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: req.body,
      query: req.query
    });
    
    return next(new ValidationError('Invalid input detected'));
  }

  next();
};

// Request validation handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    logger.warn('Validation error', {
      errors: errors.array(),
      ip: req.ip,
      endpoint: req.originalUrl
    });
    
    return next(new ValidationError(firstError.msg, firstError.param));
  }
  
  next();
};

// Common validation rules
export const validationRules = {
  // MongoDB ObjectId validation
  mongoId: param('id').isMongoId().withMessage('Invalid ID format'),
  
  // Email validation
  email: body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  
  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  
  // Pagination validation
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  
  // Date validation
  date: body('date').isISO8601().withMessage('Invalid date format'),
  
  // Phone validation
  phone: body('phone').isMobilePhone('any').withMessage('Invalid phone number')
};

// Security audit logging
export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const sensitiveEndpoints = ['/auth', '/admin', '/api/users', '/api/payments'];
  
  if (sensitiveEndpoints.some(endpoint => req.originalUrl.includes(endpoint))) {
    logger.info('Sensitive endpoint access', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};