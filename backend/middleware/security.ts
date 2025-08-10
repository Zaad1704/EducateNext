// backend/middleware/security.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { securityConfig, securityUtils } from '../config/security';
import { AuditLog } from './auditLogger';
import crypto from 'crypto';

// Enhanced rate limiting with Redis store
export const createRateLimit = (windowMs: number, max: number, message: string, keyGenerator?: (req: Request) => string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message, retryAfter: Math.ceil(windowMs / 1000) },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => securityUtils.generateRateLimitKey(req.ip, req.user?.id)),
    handler: async (req, res) => {
      await new AuditLog({
        userId: req.user?.id || null,
        institutionId: req.user?.institutionId || null,
        action: 'RATE_LIMIT_EXCEEDED',
        resource: req.path,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: `Rate limit exceeded: ${max} requests per ${windowMs}ms`,
        sensitiveData: false
      }).save().catch(err => console.error('Failed to log rate limit:', err));
      
      res.status(429).json({ error: message, retryAfter: Math.ceil(windowMs / 1000) });
    }
  });
};

// Specific rate limits
export const generalRateLimit = createRateLimit(15 * 60 * 1000, securityConfig.rateLimit.maxRequests, 'Too many requests');
export const authRateLimit = createRateLimit(15 * 60 * 1000, securityConfig.rateLimit.authMaxRequests, 'Too many authentication attempts');
export const paymentRateLimit = createRateLimit(15 * 60 * 1000, securityConfig.rateLimit.paymentMaxRequests, 'Too many payment requests');
export const gradeRateLimit = createRateLimit(15 * 60 * 1000, securityConfig.rateLimit.gradeMaxRequests, 'Too many grade requests');

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: securityConfig.headers.contentSecurityPolicy.directives,
    reportOnly: false
  },
  hsts: securityConfig.headers.hsts,
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true
});

// Advanced input sanitization and validation
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = securityUtils.sanitizeInput(req.body);
    req.query = securityUtils.sanitizeInput(req.query);
    req.params = securityUtils.sanitizeInput(req.params);
    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({ error: 'Invalid input format' });
  }
};

// Enhanced injection prevention
export const preventInjection = async (req: Request, res: Response, next: NextFunction) => {
  const checkInput = (obj: any, path: string = ''): { isValid: boolean; threats: string[] } => {
    let allThreats: string[] = [];
    
    if (typeof obj === 'string') {
      const validation = securityUtils.validateInput(obj);
      if (!validation.isValid) {
        allThreats.push(...validation.threats);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const keyValidation = securityUtils.validateInput(key);
        if (!keyValidation.isValid) {
          allThreats.push(...keyValidation.threats);
        }
        
        const valueValidation = checkInput(value, `${path}.${key}`);
        if (!valueValidation.isValid) {
          allThreats.push(...valueValidation.threats);
        }
      }
    }
    
    return {
      isValid: allThreats.length === 0,
      threats: [...new Set(allThreats)]
    };
  };

  const bodyValidation = checkInput(req.body, 'body');
  const queryValidation = checkInput(req.query, 'query');
  const paramsValidation = checkInput(req.params, 'params');

  const allThreats = [...bodyValidation.threats, ...queryValidation.threats, ...paramsValidation.threats];
  
  if (allThreats.length > 0) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'INJECTION_ATTEMPT',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: `Injection attempt detected: ${allThreats.join(', ')}`,
      sensitiveData: true,
      metadata: {
        threats: allThreats,
        body: JSON.stringify(req.body),
        query: JSON.stringify(req.query),
        params: JSON.stringify(req.params)
      }
    }).save().catch(err => console.error('Failed to log injection attempt:', err));
    
    return res.status(400).json({ 
      error: 'Potentially malicious input detected',
      code: 'SECURITY_VIOLATION'
    });
  }
  
  next();
};

// Enhanced CSRF protection
export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for auth endpoints (they use different protection)
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'CSRF_TOKEN_MISSING',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'CSRF token missing',
      sensitiveData: true
    }).save().catch(err => console.error('Failed to log CSRF violation:', err));
    
    return res.status(403).json({ error: 'CSRF token required', code: 'CSRF_TOKEN_MISSING' });
  }

  if (!securityUtils.verifyCSRFToken(token, sessionToken)) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'CSRF_TOKEN_INVALID',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Invalid CSRF token',
      sensitiveData: true
    }).save().catch(err => console.error('Failed to log CSRF violation:', err));
    
    return res.status(403).json({ error: 'Invalid CSRF token', code: 'CSRF_TOKEN_INVALID' });
  }

  next();
};

// MongoDB ObjectId validation with enhanced security
export const validateObjectId = (field: string) => {
  return param(field).custom((value) => {
    if (!value || typeof value !== 'string') {
      throw new Error(`${field} is required and must be a string`);
    }
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${field} format`);
    }
    if (value.length !== 24) {
      throw new Error(`Invalid ${field} length`);
    }
    return true;
  });
};

// Enhanced validation rules
export const validateEmail = body('email')
  .isEmail({ allow_utf8_local_part: false })
  .normalizeEmail({ gmail_remove_dots: false })
  .isLength({ max: 254 })
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: securityConfig.password.minLength, max: securityConfig.password.maxLength })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage(`Password must be ${securityConfig.password.minLength}-${securityConfig.password.maxLength} characters with uppercase, lowercase, number, and special character`);

export const validateName = body('name')
  .isLength({ min: 2, max: 50 })
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes');

// Enhanced validation error handler
export const handleValidationErrors = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    await new AuditLog({
      userId: req.user?.id || null,
      institutionId: req.user?.institutionId || null,
      action: 'VALIDATION_ERROR',
      resource: req.path,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      errorMessage: 'Input validation failed',
      sensitiveData: false,
      metadata: {
        errors: errors.array()
      }
    }).save().catch(err => console.error('Failed to log validation error:', err));
    
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
        value: err.type === 'field' ? '[REDACTED]' : undefined
      }))
    });
  }
  next();
};

// Request ID middleware for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Security monitoring middleware
export const securityMonitoring = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    // Log suspicious activities
    if (res.statusCode >= 400 || duration > 10000) {
      await new AuditLog({
        userId: req.user?.id || null,
        institutionId: req.user?.institutionId || null,
        action: res.statusCode >= 400 ? 'REQUEST_FAILED' : 'SLOW_REQUEST',
        resource: req.path,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? `Request failed with status ${res.statusCode}` : `Slow request: ${duration}ms`,
        sensitiveData: false,
        metadata: {
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('content-length')
        }
      }).save().catch(err => console.error('Failed to log request:', err));
    }
  });
  
  next();
};