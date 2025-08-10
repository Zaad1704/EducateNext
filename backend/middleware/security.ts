// backend/middleware/security.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult, param, query } from 'express-validator';
import mongoose from 'mongoose';

// Rate limiting middleware
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests');

// Auth rate limit (stricter)
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts');

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(/[<>]/g, '').trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};

// MongoDB ObjectId validation
export const validateObjectId = (field: string) => {
  return param(field).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${field} format`);
    }
    return true;
  });
};

// Common validation rules
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character');

export const validateName = body('name')
  .isLength({ min: 2, max: 50 })
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name must be 2-50 characters and contain only letters and spaces');

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] as string;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || token !== sessionToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
};

// SQL/NoSQL injection prevention
export const preventInjection = (req: Request, res: Response, next: NextFunction) => {
  const checkForInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      const injectionPatterns = [
        /\$where/i,
        /\$ne/i,
        /\$gt/i,
        /\$lt/i,
        /\$regex/i,
        /\$or/i,
        /\$and/i,
        /javascript:/i,
        /<script/i,
      ];
      return injectionPatterns.some(pattern => pattern.test(obj));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForInjection(value));
    }
    
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query) || checkForInjection(req.params)) {
    return res.status(400).json({ error: 'Potentially malicious input detected' });
  }
  
  next();
};